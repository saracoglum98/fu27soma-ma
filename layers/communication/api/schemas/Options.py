from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

class OptionsR(BaseModel):
    uuid: UUID
    name: str
    knowledge: Optional[List[str]] = []

class OptionsCU(BaseModel):
    name: str