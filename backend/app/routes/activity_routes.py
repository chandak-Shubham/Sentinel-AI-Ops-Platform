from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.activity_log import ActivityLog
from app.models.incident import Incident
from app.schemas.activity_log_schema import ActivityLogResponse
from app.utils.dependencies import get_current_user
from app.utils.permission import can_view_logs, deny, is_admin

router = APIRouter(
    prefix="/activity-logs",
    tags=["Activity Logs"]
)


@router.get("/", response_model=list[ActivityLogResponse])
def get_activity_logs(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if not can_view_logs(current_user):
        deny("You do not have permission to view activity logs")

    query = db.query(ActivityLog)

    if not is_admin(current_user):
        query = (
            query.outerjoin(Incident, ActivityLog.incident_id == Incident.id)
            .filter(Incident.team_id == current_user.team_id)
        )

    return query.order_by(ActivityLog.created_at.desc()).all()
