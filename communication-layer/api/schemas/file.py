from pydantic import BaseModel
from pydantic import UUID4, AnyUrl

class FileResponse(BaseModel):
    uuid: UUID4
    name: str
    url: AnyUrl
 