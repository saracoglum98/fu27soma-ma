from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from enum import Enum

class KPIType(str, Enum):
    qualitative = "qualitative"
    quantitative = "quantitative"

class KPIBase(BaseModel):
    key: str
    type: KPIType

class QualitativeKPI(KPIBase):
    value: Optional[str] = None

class QuantitativeKPI(KPIBase):
    value: str

# Read models (used for GET responses)
class KPIsR(BaseModel):
    uuid: UUID
    type: KPIType
    key: str
    value: Optional[str] = None

class KPIsSimpleR(BaseModel):
    type: KPIType
    key: str
    value: Optional[str] = None

# Create models
class QualitativeKPIC(BaseModel):
    key: str
    type: KPIType = KPIType.qualitative

class QuantitativeKPIC(BaseModel):
    key: str
    value: str
    type: KPIType = KPIType.quantitative

# Update models
class QualitativeKPIU(BaseModel):
    key: Optional[str] = None
    value: Optional[str] = None

class QuantitativeKPIU(BaseModel):
    key: Optional[str] = None
    value: Optional[str] = None
