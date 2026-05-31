from app.models.log import Log
from app.models.incident import Incident
from app.services.rule_engine import classify_event


def create_log(db, log_data):
    level = classify_event(
        log_data.event_type
    )
    log = Log(
        service_name=log_data.service_name,
        source=log_data.source,
        event_type=log_data.event_type,
        log_level=level,
        message=log_data.message
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    if level in ["ERROR", "CRITICAL"]:

        incident = Incident(
            title=log_data.event_type.replace("_", " ").title(),
            description=log_data.message,
            severity="HIGH",
            status="OPEN",
            source=log_data.source,
            created_by=None,
            assigned_to=None,
            team_id=None
        )
        db.add(incident)
        db.commit()
        db.refresh(incident)
        log.incident_id = incident.id
        db.commit()
        db.refresh(log)
    return log


def get_all_logs(db):

    return db.query(Log).all()