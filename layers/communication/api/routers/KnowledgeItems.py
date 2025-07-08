from fastapi import APIRouter, HTTPException, status, UploadFile
from datetime import datetime
from typing import List
from schemas.KnowledgeItems import KnowledgeItemsR, KnowledgeItemsCreate, KnowledgeItemsUpdate, KnowledgeItemsUpload
from connections import my_db, my_minio, my_qdrant
from tools import chunk_text, embed_text
import os
from io import BytesIO
from docling.document_converter import DocumentConverter
from markitdown import MarkItDown
import uuid as uuid_pkg
from qdrant_client.models import PointStruct
import traceback
import sys

# Initialize MinIO client



router = APIRouter(
    prefix="/knowledge_items",
    tags=["knowledge_items"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", name="Read all", response_model=List[KnowledgeItemsR])
async def knowledge_items_read_all():
    try:
        conn = my_db()
        cur = conn.cursor()
        cur.execute("SELECT uuid, name, size, type, url, content, length FROM knowledge_items")
        knowledge_items = cur.fetchall()
        cur.close()
        conn.close()
        
        return [
            {
                "uuid": str(knowledge_item["uuid"]),
                "name": knowledge_item["name"],
                "size": knowledge_item["size"] if knowledge_item["size"] else None,
                "type": knowledge_item["type"] if knowledge_item["type"] else None,
                "url": knowledge_item["url"] if knowledge_item["url"] else None,
                "content": knowledge_item["content"] if knowledge_item["content"] else None,
                "length": knowledge_item["length"] if knowledge_item["length"] else None
            }
            for knowledge_item in knowledge_items
        ]
    except Exception as e:
        print(f"Error in {__file__}:{traceback.extract_tb(sys.exc_info()[2])[-1].lineno}:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{uuid}", name="Delete", status_code=status.HTTP_200_OK)
async def knowledge_item_delete(uuid: str):
    try:
        conn = my_db()
        cur = conn.cursor()
        
        # First check if the knowledge item exists and get its URL
        cur.execute("SELECT uuid, url FROM knowledge_items WHERE uuid = %s", (uuid,))
        knowledge_item = cur.fetchone()
        if knowledge_item is None:
            cur.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Knowledge item not found")
        
        # If there's a URL, delete the file from MinIO
        if knowledge_item["url"]:
            try:
                url = knowledge_item["url"]
                object_name = url.replace(f'http://localhost:9000/{os.getenv("MINIO_DEFAULT_BUCKET")}/', '')
                
                # Delete object from MinIO
                minio_client = my_minio()
                minio_client.remove_object(
                    bucket_name=os.getenv("MINIO_DEFAULT_BUCKET"),
                    object_name=object_name
                )
            except Exception as e:
                # Log the error but continue with database deletion
                print(f"Error deleting file from MinIO: {str(e)}")
        
        # Delete the knowledge item from database
        cur.execute("DELETE FROM knowledge_items WHERE uuid = %s", (uuid,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return None
    except Exception as e:
        print(f"Error in {__file__}:{traceback.extract_tb(sys.exc_info()[2])[-1].lineno}:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", name="Create", response_model=KnowledgeItemsR, status_code=status.HTTP_201_CREATED)
async def knowledge_item_create(knowledge_item: KnowledgeItemsCreate):
    try:
        conn = my_db()
        cur = conn.cursor()
        
        cur.execute(
            """
            INSERT INTO knowledge_items (name)
            VALUES (%s)
            RETURNING uuid, name
            """,
            (knowledge_item.name,)
        )
        created_knowledge_item = cur.fetchone()
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            "uuid": str(created_knowledge_item["uuid"]),
            "name": created_knowledge_item["name"],
        }
    except Exception as e:
        print(f"Error in {__file__}:{traceback.extract_tb(sys.exc_info()[2])[-1].lineno}:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
    
@router.put("/upload/{uuid}", name="Upload", response_model=KnowledgeItemsR)
async def knowledge_item_upload(uuid: str, file: UploadFile):
    try:
        conn = my_db()
        cur = conn.cursor()
        
        
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        # Generate a unique object name using original filename
        object_name = f"{uuid}/{datetime.now().strftime('%Y%m%d_%H%M%S')}/{file.filename}"
        
        # Upload file to MinIO
        
        minio_client = my_minio()
        minio_client.put_object(
            bucket_name=os.getenv("MINIO_DEFAULT_BUCKET"),
            object_name=object_name,
            data=BytesIO(file_content),
            length=file_size,
            content_type=file.content_type
        )
    
        
        # Generate direct URL for public bucket
        url = f"{'http://data-object:9000'}/{os.getenv('MINIO_DEFAULT_BUCKET')}/{object_name}"
        
        # Convert file to text
        md = MarkItDown(enable_plugins=False) # Set to True to enable plugins
        result = md.convert(url)
        content = result.text_content   
        
        # Generate embeddings for content
        chunks = chunk_text(content)
        
        embeddings = []
        for chunk in chunks:
            embedding = embed_text(chunk)
            embeddings.append(embedding)
        
        metadata = {
            "filename": file.filename,
            "content_type": file.content_type,
            "total_characters": len(content)
        }
        
        points = []
        point_ids = []
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            point_id = str(uuid_pkg.uuid4())
            point_ids.append(point_id)
            
            payload = {
                "text": chunk,
                "document_uuid": uuid,
                "chunk_index": i,
                "total_chunks": len(chunks),
                "chunk_size": len(chunk),
                **metadata
            }
            
            points.append(PointStruct(
                id=point_id,
                vector=embedding,
                payload=payload
            ))
        
        
        qdrant_client = my_qdrant()
        qdrant_client.upsert(collection_name=os.getenv("QDRANT_DEFAULT_COLLECTION"),points=points)
        
        # Update knowledge item with URL and length
        cur.execute(
            """
            UPDATE knowledge_items 
            SET url = %s, length = %s, content = %s, size = %s, type = %s
            WHERE uuid = %s
            RETURNING uuid, name, url, length, size, type, content
            """,
            (url.replace('http://data-object', 'http://localhost'), len(content), content, file_size, file.content_type, str(uuid))
        )
        updated_item = cur.fetchone()
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            "uuid": str(updated_item["uuid"]),
            "name": updated_item["name"],
            "size": updated_item["size"],
            "type": updated_item["type"],
            "url": updated_item["url"],
            "content": updated_item["content"],
            "length": updated_item["length"]
        }
    except Exception as e:
        print(f"Error in {__file__}:{traceback.extract_tb(sys.exc_info()[2])[-1].lineno}:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
    