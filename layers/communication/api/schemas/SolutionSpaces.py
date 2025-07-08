from pydantic import BaseModel
from pydantic import AnyUrl
from typing import List, Optional
from uuid import UUID

class SolutionSpacesR(BaseModel):
    uuid: UUID
    name: str
    functions: Optional[List[str]] = []

class SolutionSpacesCU(BaseModel):
    name: str
    functions: Optional[List[str]] = []    
