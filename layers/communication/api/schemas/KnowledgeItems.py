from pydantic import BaseModel
from pydantic import AnyUrl
from uuid import UUID
from typing import Optional
from fastapi import UploadFile

class KnowledgeItemsR(BaseModel):
    uuid: UUID
    name: str
    size: Optional[int] = None
    type: Optional[str] = None
    url: Optional[AnyUrl] = None
    content: Optional[str] = None
    length: Optional[int] = None

class KnowledgeItemsCreate(BaseModel):
    name: str

class KnowledgeItemsUpdate(BaseModel):
    name: Optional[str] = None
    size: int
    type: str
    url: AnyUrl
    content: str
    length: int
    
class KnowledgeItemsUpload(BaseModel):
    file: UploadFile