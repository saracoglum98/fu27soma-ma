from pydantic import BaseModel
from typing import Any

class CommonResponse(BaseModel):
    data: Any
