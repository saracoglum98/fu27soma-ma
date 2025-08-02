from pydantic import BaseModel
from pydantic import AnyUrl
from typing import List, Optional
from uuid import UUID

class FunctionsR(BaseModel):
    uuid: UUID
    name: str
    options: Optional[List[str]] = []
 
class FunctionsCU(BaseModel):
    name: str
