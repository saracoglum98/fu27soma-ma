from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

class AnalysisItem(BaseModel):
    kpi: str
    rationale: str
    assessment: str

class SolutionAnalysis(BaseModel):
    solution_id: int
    qualitative_analysis: List[AnalysisItem]
    quantitative_analysis: List[AnalysisItem]

class SolutionsR(BaseModel):
    uuid: UUID
    name: str
    req_customer: str
    req_business: str
    result_initial: Optional[dict] = None
    result_initial_analysis: Optional[list] = None
    result_final: Optional[dict] = None
    result_final_analysis: Optional[list] = None
    sysml: Optional[dict] = None
    knowledge: Optional[List[str]] = []

class SolutionsC(BaseModel):
    name: str

class SolutionsU(BaseModel):
    name: str
    req_customer: str
    req_business: str