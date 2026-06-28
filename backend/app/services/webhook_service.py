from sqlalchemy.orm import Session
from app.models.incident import Incident
from app.models.team import Team
from app.models.webhook_log import WebhookLog
from app.utils.activity_logger import log_activity
from app.services.ai_analysis_service import analyze_webhook
from app.services.incident_generator import generate_incident


def _get_webhook_team_id(data, db: Session):
    payload_team_id = data.payload.get("team_id") if isinstance(data.payload, dict) else None
    if payload_team_id:
        team = db.query(Team).filter(Team.id == payload_team_id).first()
        if team:
            return team.id

    tech_team = db.query(Team).filter(Team.team_name == "Tech Team").first()
    return tech_team.id if tech_team else None


def _create_incident_for_webhook_error(data, webhook, db: Session):
    level = data.level.upper()
    if level not in {"ERROR", "CRITICAL"}:
        return None

    incident = Incident(
        title=f"{level} from {data.service}",
        description=data.message,
        severity="CRITICAL" if level == "CRITICAL" else "HIGH",
        status="OPEN",
        source="WEBHOOK",
        team_id=_get_webhook_team_id(data, db),
    )

    db.add(incident)
    db.commit()
    db.refresh(incident)

    log_activity(
        db=db,
        action="WEBHOOK_CREATED_INCIDENT",
        user_id=None,
        incident_id=incident.id,
        details=f"Webhook log #{webhook.id} from {data.service} created incident '{incident.title}'"
    )

    return incident


def create_webhook_log(
    data,
    db: Session
):
    webhook = WebhookLog(
        service=data.service,
        level=data.level,
        message=data.message,
        payload=data.payload
    )

    db.add(webhook)
    db.commit()
    db.refresh(webhook)

    analysis = analyze_webhook(
        webhook,
        db
    )

    incident = generate_incident(
        webhook,
        analysis,
        db
    )

    return {
        "webhook": webhook,
        "analysis": analysis,
        "incident": incident
    }


def get_all_webhook_logs(
    db: Session
):
    return (
        db.query(WebhookLog)
        .order_by(WebhookLog.received_at.desc())
        .all()
    )


def get_webhook_log_by_id(
    webhook_id: int,
    db: Session
):
    return (
        db.query(WebhookLog)
        .filter(WebhookLog.id == webhook_id)
        .first()
    )
