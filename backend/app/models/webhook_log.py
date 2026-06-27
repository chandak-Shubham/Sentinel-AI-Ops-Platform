from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    TIMESTAMP
)

from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func

from app.core.database import Base


class WebhookLog(Base):
    __tablename__ = "webhook_logs"

    id = Column(Integer, primary_key=True, index=True)

    service = Column(String(100), nullable=False)

    level = Column(String(20), nullable=False)

    message = Column(Text, nullable=False)

    payload = Column(JSONB, nullable=False)

    received_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now()
    )