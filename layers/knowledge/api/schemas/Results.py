from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

class ResultsR(BaseModel):
    uuid: UUID
    name: str
    map: dict
    
class ResultsCU(BaseModel):
    name: str
    map: dict