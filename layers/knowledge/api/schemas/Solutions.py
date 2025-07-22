from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

class SolutionsR(BaseModel):
    uuid: UUID
    name: str
    req_customer: str
    req_business: str
    results: Optional[List[str]] = []
    knowledge: Optional[List[str]] = []

class SolutionsC(BaseModel):
    name: str

class SolutionsU(BaseModel):
    name: str
    req_customer: str
    req_business: str