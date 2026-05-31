from app.models.incident import Incident


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

    return incident


def get_all_incidents(db):

    return db.query(Incident).all()