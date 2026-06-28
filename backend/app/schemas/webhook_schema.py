from datetime import datetime
from typing import Any

from pydantic import BaseModel
from app.schemas.ai_analysis_schema import AIAnalysisResponse
from app.schemas.incident_schema import IncidentResponse


class WebhookLogCreate(BaseModel):
    service: str
    level: str
    message: str
    payload: dict[str, Any]


class WebhookLogResponse(BaseModel):
    id: int
    service: str
    level: str
    message: str
    payload: dict[str, Any]
    received_at: datetime

    class Config:
        from_attributes = True


class WebhookPipelineResponse(BaseModel):
    webhook: WebhookLogResponse
    analysis: AIAnalysisResponse
    incident: IncidentResponse | None

    class Config:
        from_attributes = True