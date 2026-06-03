from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.log_schema import LogCreate

from app.services.log_service import (
    create_log,
    get_all_logs
)

from app.websocket.connection_manager import manager

router = APIRouter(
    prefix="/logs",
    tags=["Logs"]
)


@router.post("/")
async def create_new_log(
    log_data: LogCreate,
    db: Session = Depends(get_db)
):

    log = create_log(
        db,
        log_data
    )

    await manager.broadcast(
        {
            "event": "new_log",
            "log_id": log.id,
            "service_name": log.service_name,
            "source": log.source,
            "event_type": log.event_type,
            "log_level": log.log_level,
            "message": log.message,
            "incident_id": log.incident_id
        }
    )

    return log


@router.get("/")
def get_logs(
    db: Session = Depends(get_db)
):
    return get_all_logs(db)