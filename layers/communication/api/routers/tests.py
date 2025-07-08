from fastapi import APIRouter, HTTPException
from datetime import datetime
from ollama import Client


router = APIRouter(
    prefix="/tests",
    tags=["tests"],
    responses={404: {"description": "Not found"}},
)

@router.get("/models")
async def models():
    try:
        client = Client(host='http://llm-inference:11434')
        models = client.list()
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        