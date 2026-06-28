from sqlalchemy.orm import Session

from app.models.activity_log import ActivityLog
from app.websocket.manager import manager
import asyncio


def log_activity(
    db: Session,
    action: str,
    user_id: int | None,
    incident_id: int |None,
    details: str
):
    log = ActivityLog(
        action=action,
        user_id=user_id,
        incident_id=incident_id,
        details=details
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    try:
        asyncio.create_task(
            manager.broadcast(
                "activity_created",
                {
                    "id": log.id,
                    "action": log.action,
                    "user_id": log.user_id,
                    "incident_id": log.incident_id,
                    "details": log.details,
                },
            )
        )
    except Exception:
        pass