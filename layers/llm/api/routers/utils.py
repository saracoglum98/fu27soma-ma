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
from dotenv import load_dotenv
import re
from connections import my_db
from tools import get_agent_schema

load_dotenv()


router = APIRouter(
    prefix="/utils",
    tags=["utils"],
    responses={404: {"description": "Not found"}},
)

@router.get("/agent-schema/{agent_name}", name="Agent Schema", response_model=CommonResponse)
async def agent_schema(agent_name: str):
    try:
        agent_config = await get_agent_schema(agent_name)
        return {"data": agent_config}
    except Exception as e:
        print(f"Error in {__file__}:{traceback.extract_tb(sys.exc_info())[-1].lineno}:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/agent-call/{agent_name}", name="Agent Call", response_model=CommonResponse)
async def agent_call(agent_name: str, prompt: str):
    try:
        agent_config = await call_agent(agent_name, prompt)
        return {"data": agent_config}
    except Exception as e:
        print(f"Error in {__file__}:{traceback.extract_tb(sys.exc_info())[-1].lineno}:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

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