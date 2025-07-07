from fastapi import APIRouter, HTTPException, status, UploadFile
from datetime import datetime
from typing import List
from schemas.KnowledgeItems import KnowledgeItemsR, KnowledgeItemsCreate, KnowledgeItemsUpdate, KnowledgeItemsUpload
from database import get_db_connection
from minio import Minio
import os
from io import BytesIO
from docling.document_converter import DocumentConverter
from markitdown import MarkItDown

# Initialize MinIO client
minio_client = Minio("data-object:9000",
                        access_key="root",
                        secret_key="fu27soma",
                        secure=False)


router = APIRouter(
    prefix="/knowledge_items",
    tags=["knowledge_items"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", name="Read all", response_model=List[KnowledgeItemsR])
async def knowledge_items_read_all():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT uuid, name, url, length FROM knowledge_items")
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
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{uuid}", name="Delete", status_code=status.HTTP_200_OK)
async def knowledge_item_delete(uuid: str):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # First check if the knowledge item exists
        cur.execute("SELECT uuid FROM knowledge_items WHERE uuid = %s", (uuid,))
        if cur.fetchone() is None:
            cur.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Knowledge item not found")
        
        # Delete the knowledge item
        cur.execute("DELETE FROM knowledge_items WHERE uuid = %s", (uuid,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", name="Create", response_model=KnowledgeItemsR, status_code=status.HTTP_201_CREATED)
async def knowledge_item_create(knowledge_item: KnowledgeItemsCreate):
    try:
        conn = get_db_connection()
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
        raise HTTPException(status_code=500, detail=str(e))
    
@router.put("/upload/{uuid}", name="Upload", response_model=KnowledgeItemsR)
async def knowledge_item_upload(uuid: str, file: UploadFile):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        # Generate a unique object name using original filename
        object_name = f"{uuid}/{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
        
        # Upload file to MinIO
        minio_client.put_object(
            bucket_name=BUCKET_NAME,
            object_name=object_name,
            data=BytesIO(file_content),
            length=file_size,
            content_type=file.content_type
        )
    
        
        # Generate presigned URL (valid for 7 days)
        url = minio_client.presigned_get_object(BUCKET_NAME, object_name)
        
        # Convert file to text
        md = MarkItDown(enable_plugins=False) # Set to True to enable plugins
        result = md.convert(url)
        content = result.text_content   
        
        # Update knowledge item with URL and length
        cur.execute(
            """
            UPDATE knowledge_items 
            SET url = %s, length = %s, content = %s, size = %s, type = %s
            WHERE uuid = %s
            RETURNING uuid, name, url, length
            """,
            (url, len(content), content, file_size, file.content_type, str(uuid))
        )
        updated_item = cur.fetchone()
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            "uuid": str(updated_item["uuid"]),
            "name": updated_item["name"],
            "url": updated_item["url"],
            "length": updated_item["length"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    