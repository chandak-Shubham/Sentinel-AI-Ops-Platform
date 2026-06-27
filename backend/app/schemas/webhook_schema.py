from datetime import datetime
from typing import Any

from pydantic import BaseModel


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