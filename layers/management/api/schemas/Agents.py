from pydantic import BaseModel
from typing import Any
from uuid import UUID

class AgentsR(BaseModel):
    uuid: UUID
    name: Any
    model: str
    temperature: float
    prompt_system: str
    prompt_user: str
    output_schema: str
    
class AgentsU(BaseModel):
    temperature: float
    prompt_system: str
    prompt_user: str
    output_schema: str
