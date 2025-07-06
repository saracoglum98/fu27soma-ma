from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

class SolutionsR(BaseModel):
    uuid: UUID
    name: str
    input_customer: str
    input_business: str
    results: Optional[List[str]] = []

class SolutionsCU(BaseModel):
    name: str
    input_customer: str
    input_business: str
    results: Optional[List[str]] = []