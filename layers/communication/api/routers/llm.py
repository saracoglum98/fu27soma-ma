from fastapi import APIRouter, HTTPException
from datetime import datetime
from schemas.file import FileResponse
from ollama import Client


router = APIRouter(
    prefix="/llm",
    responses={404: {"description": "Not found"}},
)

@router.post("/test")
async def test():
    try:
        client = Client(host='http://llm-inference:11434')
        models = client.list()
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        