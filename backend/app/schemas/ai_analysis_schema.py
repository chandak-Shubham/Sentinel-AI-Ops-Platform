from datetime import datetime

from typing import List

from pydantic import BaseModel


class AIAnalysisResponse(BaseModel):

    id: int

    webhook_log_id: int

    summary: str

    severity: str

    root_cause: str

    recommendations: List[str]

    confidence: float

    should_create_incident: bool

    analyzed_at: datetime

    class Config:

        from_attributes = True