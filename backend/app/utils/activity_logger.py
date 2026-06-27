from sqlalchemy.orm import Session

from app.models.activity_log import ActivityLog


def log_activity(
    db: Session,
    action: str,
    user_id: int | None,
    incident_id: int | None,
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