from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.incident_schema import (IncidentCreate)
from app.services.incident_service import (create_incident,get_all_incidents)

router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"]
)

@router.post("/")
def create_new_incident(
    incident_data: IncidentCreate,
    db: Session = Depends(get_db)
):
    return create_incident(
        db,
        incident_data,
        user_id=1
    )

@router.get("/")
def get_incidents(
    db: Session = Depends(get_db)
):
    return get_all_incidents(db)