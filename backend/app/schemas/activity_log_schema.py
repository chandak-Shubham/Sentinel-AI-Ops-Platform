from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ActivityLogResponse(BaseModel):
    id: int
    action: str
    user_id: Optional[int]
    incident_id: Optional[int]
    details: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True