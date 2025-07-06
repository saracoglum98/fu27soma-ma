from pydantic import BaseModel
from pydantic import AnyUrl
from typing import List, Optional
from uuid import UUID

class FunctionsR(BaseModel):
    uuid: UUID
    name: str
    knowledge: Optional[List[str]] = []
    options: Optional[List[str]] = []
 
class FunctionsCU(BaseModel):
    name: str
    knowledge: Optional[List[str]] = []
    options: Optional[List[str]] = []
