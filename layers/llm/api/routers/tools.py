from fastapi import APIRouter, UploadFile, HTTPException
from schemas.Common import CommonResponse
from markitdown import MarkItDown
from io import BytesIO
import os
import traceback
import sys

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
        print(f"Error in {__file__}:{traceback.extract_tb(sys.exc_info()[2])[-1].lineno}:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))