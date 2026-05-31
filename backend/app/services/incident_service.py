from app.models.incident import Incident
from app.services.incident_log_service import (
    create_incident_log
)


def create_incident(
    db,
    incident_data,
    user_id
):

    incident = Incident(
        title=incident_data.title,
        description=incident_data.description,
        severity=incident_data.severity,
        status="OPEN",
        created_by=user_id,
        team_id=incident_data.team_id
    )

    db.add(incident)

    db.commit()

    db.refresh(incident)

    create_incident_log(
        db,
        incident.id,
        "INCIDENT_CREATED",
        f"Incident '{incident.title}' created",
        user_id
    )

    return incident


def get_all_incidents(db):

    return db.query(Incident).all()


def update_incident_status(
    db,
    incident_id,
    new_status
):

    incident = db.query(Incident).filter(
        Incident.id == incident_id
    ).first()

    if not incident:
        return None

    old_status = incident.status

    incident.status = new_status

    db.commit()

    db.refresh(incident)

    create_incident_log(
        db,
        incident.id,
        "STATUS_CHANGED",
        f"{old_status} -> {new_status}"
    )

    return {
        "incident": incident,
        "old_status": old_status
    }