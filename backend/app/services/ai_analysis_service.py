from sqlalchemy.orm import Session

from app.ai.analyzer import analyze_log

from app.models.ai_analysis import AIAnalysis

from app.models.webhook_log import WebhookLog


def analyze_webhook(
    webhook: WebhookLog,
    db: Session
):

    result = analyze_log(

        service=webhook.service,

        level=webhook.level,

        message=webhook.message,

        payload=webhook.payload

    )

    analysis = AIAnalysis(

        webhook_log_id=webhook.id,

        summary=result.summary,

        severity=result.severity,

        root_cause=result.root_cause,

        recommendations=result.recommendations,

        confidence=result.confidence,

        should_create_incident=result.should_create_incident

    )

    db.add(analysis)

    db.commit()

    db.refresh(analysis)

    return analysis