from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.schemas.webhook_schema import (
    WebhookLogCreate,
    WebhookLogResponse
)

from app.services import webhook_service

router = APIRouter(
    prefix="/webhooks",
    tags=["Webhooks"]
)

@router.post(
    "/logs",
    response_model=WebhookLogResponse
)
def receive_webhook(
    data: WebhookLogCreate,
    db: Session = Depends(get_db)
):

    return webhook_service.create_webhook_log(
        data=data,
        db=db
    )

@router.get(
    "/logs",
    response_model=list[WebhookLogResponse]
)
def get_all_logs(
    db: Session = Depends(get_db)
):

    return webhook_service.get_all_webhook_logs(
        db
    )

@router.get(
    "/logs/{webhook_id}",
    response_model=WebhookLogResponse
)
def get_log(
    webhook_id: int,
    db: Session = Depends(get_db)
):

    webhook = webhook_service.get_webhook_log_by_id(
        webhook_id,
        db
    )

    if webhook is None:
        raise HTTPException(
            status_code=404,
            detail="Webhook log not found"
        )

    return webhook

