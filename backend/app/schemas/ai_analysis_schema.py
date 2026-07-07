from datetime import datetime

from typing import List

from pydantic import BaseModel, field_validator


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

    @field_validator("recommendations", mode="before")
    @classmethod
    def validate_recommendations(cls, v):
        if isinstance(v, str):
            return [v]
        return v

    class Config:

        from_attributes = True