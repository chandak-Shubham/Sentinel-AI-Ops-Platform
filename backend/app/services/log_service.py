from app.models.log import Log
from app.models.incident import Incident

from app.services.rule_engine import classify_event
from app.services.incident_log_service import (
    create_incident_log
)


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

        incident_title = (
            log_data.event_type
            .replace("_", " ")
            .title()
        )

        existing_incident = (
            db.query(Incident)
            .filter(
                Incident.title == incident_title,
                Incident.status.in_(
                    ["OPEN", "IN_PROGRESS"]
                )
            )
            .first()
        )

        if existing_incident:

            log.incident_id = existing_incident.id

            db.commit()
            db.refresh(log)

            create_incident_log(
                db,
                existing_incident.id,
                "LOG_ATTACHED",
                f"{log_data.event_type} event received"
            )

        else:

            incident = Incident(
                title=incident_title,
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

            create_incident_log(
                db,
                incident.id,
                "INCIDENT_CREATED",
                f"Incident '{incident.title}' created automatically from log"
            )

            log.incident_id = incident.id

            db.commit()
            db.refresh(log)

    return log


def get_all_logs(db):

    return db.query(Log).all()