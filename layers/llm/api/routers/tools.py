from fastapi import APIRouter, UploadFile, HTTPException
from schemas.Common import CommonResponse
from markitdown import MarkItDown
from io import BytesIO
import os
import traceback
import sys
import httpx
import json
import asyncio
from typing import Optional, List
from connections import my_qdrant

router = APIRouter(
    prefix="/tools",
    tags=["tools"],
    responses={404: {"description": "Not found"}},
)


@router.post("/convert", name="Convert", response_model=CommonResponse)
async def convert(file: UploadFile):
    try:
        # Read file content
        file_content = await file.read()

        # Create a temporary URL-like string for the file
        temp_url = f"memory://{file.filename}"

        # Initialize MarkItDown
        md = MarkItDown(enable_plugins=False)

        # Convert file content
        result = md.convert_bytes(file_content, mime_type=file.content_type)

        return {"data": result.text_content}

    except Exception as e:
        print(
            f"Error in {__file__}:{traceback.extract_tb(sys.exc_info()[2])[-1].lineno}:"
        )
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sysml/{option_uuid}", name="SysML", response_model=CommonResponse)
async def sysml(option_uuid: str):
    try:
        # Get Qdrant client
        qdrant_client = my_qdrant()

        # Fetch option details from the knowledge API
        async with httpx.AsyncClient(timeout=10.0) as client:
            print(f"Fetching option details for UUID: {option_uuid}")
            response = await client.get(
                f"http://knowledge-api:10000/options/{option_uuid}"
            )
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="Option not found")
            option = response.json()

            # Get document UUIDs from option.knowledge
            document_uuids = option.get("knowledge", [])
            if not document_uuids:
                print("Warning: No document UUIDs found in option.knowledge")

        # Fetch relevant documents from Qdrant
        context_documents = []
        for doc_id in document_uuids:
            try:
                # Fetch the document by its ID
                result = qdrant_client.retrieve(
                    collection_name="documents",
                    ids=[doc_id],
                )
                if result:
                    # Extract the text content from the payload
                    doc_content = result[0].payload.get("text", "")
                    context_documents.append(doc_content)
            except Exception as e:
                print(f"Error fetching document {doc_id}: {str(e)}")
                continue

        # Combine all context documents
        context = "\n\n---\n\n".join(context_documents)

        # OpenAI-compatible endpoint configuration
        api_endpoint = "http://host.docker.internal:1234/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer dummy-token",
        }

        # Prepare the chat completion request with context
        prompt = f"""Here is some relevant context from our knowledge base:

{context}

Based on this context, please analyze the following option: {option["name"]}"""

        payload = {
            "model": "expert",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
        }

        print(f"Making request to OpenAI-compatible endpoint: {api_endpoint}")
        print(f"Payload: {json.dumps(payload, indent=2)}")

        async with httpx.AsyncClient(timeout=120.0) as llm_client:
            llm_response = await llm_client.post(
                api_endpoint, json=payload, headers=headers
            )
            print(f"Response status: {llm_response.status_code}")
            print(f"Response body: {llm_response.text}")

            if llm_response.status_code != 200:
                raise HTTPException(
                    status_code=llm_response.status_code,
                    detail=f"LLM request failed: {llm_response.text}",
                )

            llm_data = llm_response.json()
            return {"data": llm_data["choices"][0]["message"]["content"]}

    except Exception as e:
        print(f"Error in sysml endpoint: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
