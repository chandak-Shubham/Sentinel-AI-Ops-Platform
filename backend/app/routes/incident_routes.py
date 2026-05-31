from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.schemas.incident_schema import (
    IncidentCreate,
    IncidentUpdate
)

from app.services.incident_service import (
    create_incident,
    get_all_incidents,
    update_incident_status
)

from app.websocket.connection_manager import manager
from app.models.incident_log import IncidentLog

router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"]
)


@router.post("/")
async def create_new_incident(
    incident_data: IncidentCreate,
    db: Session = Depends(get_db)
):

    incident = create_incident(
        db,
        incident_data,
        user_id=1
    )

    await manager.broadcast(
        {
            "event": "incident_created",
            "incident_id": incident.id,
            "title": incident.title,
            "severity": incident.severity,
            "status": incident.status,
            "team_id": incident.team_id
        }
    )

    return incident


@router.patch("/{incident_id}/status")
async def change_incident_status(
    incident_id: int,
    status_data: IncidentUpdate,
    db: Session = Depends(get_db)
):

    result = update_incident_status(
        db,
        incident_id,
        status_data.status
    )

    if not result:
        return {
            "message": "Incident not found"
        }

    incident = result["incident"]

    await manager.broadcast(
        {
            "event": "incident_status_changed",
            "incident_id": incident.id,
            "old_status": result["old_status"],
            "new_status": incident.status
        }
    )

    return incident


@router.get("/{incident_id}/timeline")
def get_incident_timeline(
    incident_id: int,
    db: Session = Depends(get_db)
):

    timeline = (
        db.query(IncidentLog)
        .filter(
            IncidentLog.incident_id == incident_id
        )
        .order_by(
            IncidentLog.created_at.asc()
        )
        .all()
    )

    return timeline


@router.get("/")
def get_incidents(
    db: Session = Depends(get_db)
):
    return get_all_incidents(db)