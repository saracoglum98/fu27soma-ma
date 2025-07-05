from fastapi import APIRouter, HTTPException
from datetime import datetime
from schemas.file import FileResponse

router = APIRouter(
    prefix="/file",
    responses={404: {"description": "Not found"}},
)

@router.post("",response_model=FileResponse)
async def create_file(file: FileResponse):
    file = {
        "uuid": 'test-uuid',
        "name": 'test-name',
        "url": 'test-url'
    }
    return {
        "status": "OK",
        "message": "File created successfully",
        "file": file
    }