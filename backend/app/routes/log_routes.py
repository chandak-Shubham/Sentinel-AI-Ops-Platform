from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.log_schema import LogCreate
from app.services.log_service import (
    create_log,
    get_all_logs
)

router = APIRouter(
    prefix="/logs",
    tags=["Logs"]
)


@router.post("/")
def create_new_log(
    log_data: LogCreate,
    db: Session = Depends(get_db)
):
    return create_log(
        db,
        log_data
    )


@router.get("/")
def get_logs(
    db: Session = Depends(get_db)
):
    return get_all_logs(db)