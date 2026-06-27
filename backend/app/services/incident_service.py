from datetime import datetime

from sqlalchemy.orm import Session

from app.models.incident import Incident
from app.utils.activity_logger import log_activity


def create_incident(
    data,
    db: Session,
    current_user
):

    incident = Incident(
        title=data.title,
        description=data.description,
        severity=data.severity,
        status="OPEN",
        source=data.source,
        created_by=current_user.id,
        assigned_to=data.assigned_to,
        team_id=data.team_id,
    )

    db.add(incident)
    db.commit()
    db.refresh(incident)

    log_activity(
        db=db,
        action="CREATE_INCIDENT",
        user_id=current_user.id,
        incident_id=incident.id,
        details=f"Created incident '{incident.title}'"
    )

    return incident


def get_all_incidents(
    db: Session
):
    return db.query(Incident).all()


def get_incident_by_id(
    incident_id: int,
    db: Session
):
    return (
        db.query(Incident)
        .filter(Incident.id == incident_id)
        .first()
    )


def update_incident(
    incident,
    data,
    db: Session,
    current_user
):

    update_data = data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(
            incident,
            key,
            value
        )

    incident.updated_at = datetime.utcnow()

    if incident.status == "RESOLVED":
        incident.resolved_at = datetime.utcnow()

    db.commit()
    db.refresh(incident)

    log_activity(
        db=db,
        action="UPDATE_INCIDENT",
        user_id=current_user.id,
        incident_id=incident.id,
        details=f"Updated incident '{incident.title}'"
    )

    return incident


def resolve_incident(
    incident,
    db: Session,
    current_user
):

    incident.status = "RESOLVED"
    incident.resolved_at = datetime.utcnow()

    db.commit()
    db.refresh(incident)

    log_activity(
        db=db,
        action="RESOLVE_INCIDENT",
        user_id=current_user.id,
        incident_id=incident.id,
        details=f"Resolved incident '{incident.title}'"
    )

    return incident


def delete_incident(
    incident,
    db: Session,
    current_user
):

    log_activity(
        db=db,
        action="DELETE_INCIDENT",
        user_id=current_user.id,
        incident_id=incident.id,
        details=f"Deleted incident '{incident.title}'"
    )

    db.delete(incident)
    db.commit()

    return True