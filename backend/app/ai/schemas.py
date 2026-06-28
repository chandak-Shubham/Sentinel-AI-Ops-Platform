from typing import List

from pydantic import BaseModel


class AIAnalysis(BaseModel):
    summary: str

    severity: str

    root_cause: str

    recommendations: List[str]

    confidence: float

    should_create_incident: bool