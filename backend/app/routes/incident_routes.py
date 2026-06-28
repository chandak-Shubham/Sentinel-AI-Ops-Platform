from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.incident_schema import (
    IncidentCreate,
    IncidentUpdate,
    IncidentResponse
)
from app.services import incident_service
from app.utils.dependencies import get_current_user

router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"]
)

@router.post(
    "/",
    response_model=IncidentResponse
)
def create_incident(
    data: IncidentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return incident_service.create_incident(
        data=data,
        db=db,
        current_user=current_user
    )


@router.get(
    "/",
    response_model=list[IncidentResponse]
)
def get_all_incidents(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return incident_service.get_all_incidents(db, current_user)


@router.get(
    "/{incident_id}",
    response_model=IncidentResponse
)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    incident = incident_service.get_incident_by_id(
        incident_id,
        db,
        current_user
    )

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    return incident


@router.patch(
    "/{incident_id}",
    response_model=IncidentResponse
)
def update_incident(
    incident_id: int,
    data: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    incident = incident_service.get_incident_by_id(
        incident_id,
        db,
        current_user
    )

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    return incident_service.update_incident(
        incident,
        data,
        db,
        current_user
    )


@router.patch(
    "/{incident_id}/resolve",
    response_model=IncidentResponse
)
def resolve_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    incident = incident_service.get_incident_by_id(
        incident_id,
        db,
        current_user
    )

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    return incident_service.resolve_incident(
        incident,
        db,
        current_user
    )


@router.delete("/{incident_id}")
def delete_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    incident = incident_service.get_incident_by_id(
        incident_id,
        db,
        current_user
    )

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    incident_service.delete_incident(
        incident,
        db,
        current_user
    )

    return {
        "message": "Incident deleted successfully"
    }


