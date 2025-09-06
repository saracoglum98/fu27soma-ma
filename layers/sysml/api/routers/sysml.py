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
from tools import import_to_sysml, export_from_sysml

load_dotenv()


router = APIRouter(
    prefix="/sysml-engine",
    tags=["sysml-engine"],
    responses={404: {"description": "Not found"}},
)

@router.get("/import/{solution_uuid}", name="Import", response_model=CommonResponse)
async def import_to_sysml(solution_uuid: str):
    pass

@router.get("/export/{solution_uuid}", name="Export", response_model=CommonResponse)
async def export_from_sysml(solution_uuid: str):
    pass