from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.utils.dependencies import get_current_user
from app.utils.permission import can_view_logs, deny

from app.schemas.webhook_schema import (
    WebhookLogCreate,
    WebhookLogResponse,
    WebhookPipelineResponse
)

from app.services import webhook_service

router = APIRouter(
    prefix="/webhooks",
    tags=["Webhooks"]
)

@router.post(
    "/logs",
    response_model=WebhookPipelineResponse
)
async def receive_webhook(
    data: WebhookLogCreate,
    db: Session = Depends(get_db)
):

    return await webhook_service.create_webhook_log(
        data=data,
        db=db
    )

@router.get(
    "/logs",
    response_model=list[WebhookLogResponse]
)
def get_all_logs(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if not can_view_logs(current_user):
        deny("You do not have permission to view webhook logs")

    return webhook_service.get_all_webhook_logs(
        db
    )

@router.get(
    "/logs/{webhook_id}",
    response_model=WebhookLogResponse
)
def get_log(
    webhook_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if not can_view_logs(current_user):
        deny("You do not have permission to view webhook logs")

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

