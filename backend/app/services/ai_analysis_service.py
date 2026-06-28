from sqlalchemy.orm import Session

from app.ai.analyzer import analyze_log
from app.models.ai_analysis import AIAnalysis
from app.models.webhook_log import WebhookLog


def analyze_webhook(
    webhook: WebhookLog,
    db: Session
):

    try:
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

    except Exception as e:

        print(f"AI Analysis Failed: {e}")

        analysis = AIAnalysis(
            webhook_log_id=webhook.id,
            summary="AI analysis unavailable.",
            severity=webhook.level.upper(),
            root_cause="Gemini API unavailable or quota exceeded.",
            recommendations=[
                "Retry AI analysis later.",
                "Check Gemini API quota."
            ],
            confidence=0.0,
            should_create_incident=webhook.level.upper() in {
                "ERROR",
                "CRITICAL"
            }
        )

    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return analysis