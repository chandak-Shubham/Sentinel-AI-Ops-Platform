from sqlalchemy.orm import Session
from app.models.incident import Incident
from app.models.webhook_log import WebhookLog
from app.models.ai_analysis import AIAnalysis
from app.utils.activity_logger import log_activity
from app.services.rule_engine import validate_ai_decision
from app.websocket.manager import manager

async def generate_incident(
    webhook: WebhookLog,
    analysis: AIAnalysis,
    db: Session
):

    if not validate_ai_decision(webhook, analysis):
        return None

    incident = Incident(
        title=f"{webhook.service} Incident",
        description=analysis.summary,
        severity=analysis.severity,
        status="OPEN",
        source="WEBHOOK",
        team_id=1,
        created_by=None,
        assigned_to=None
    )

    db.add(incident)
    db.commit()
    db.refresh(incident)

    try:
        await manager.broadcast(
            "incident_created",
            {
                "id": incident.id,
                "title": incident.title,
                "description": incident.description,
                "severity": incident.severity,
                "status": incident.status,
                "source": incident.source,
                "team_id": incident.team_id,
            },
    )
    except Exception as e:
        print(f"WebSocket broadcast failed: {e}")

    log_activity(
        db=db,
        action="AI_CREATE_INCIDENT",
        user_id=None,
        incident_id=incident.id,
        details=f"AI created incident from webhook #{webhook.id}"
    )

    return incident