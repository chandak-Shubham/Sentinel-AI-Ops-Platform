from app.models.incident_log import IncidentLog


def create_incident_log(
    db,
    incident_id,
    action_type,
    message,
    performed_by=None
):

    log = IncidentLog(
        incident_id=incident_id,
        action_type=action_type,
        message=message,
        performed_by=performed_by
    )

    db.add(log)

    db.commit()

    db.refresh(log)

    return log