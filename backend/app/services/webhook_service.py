from sqlalchemy.orm import Session

from app.models.webhook_log import WebhookLog


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

    return webhook


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