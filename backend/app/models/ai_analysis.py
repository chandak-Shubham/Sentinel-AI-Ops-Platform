from sqlalchemy import (
    Boolean,
    Column,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    TIMESTAMP
)

from sqlalchemy.dialects.postgresql import JSONB

from sqlalchemy.orm import relationship

from sqlalchemy.sql import func

from app.core.database import Base


class AIAnalysis(Base):

    __tablename__ = "ai_analysis"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    webhook_log_id = Column(
        Integer,
        ForeignKey(
            "webhook_logs.id",
            ondelete="CASCADE"
        ),
        unique=True,
        nullable=False
    )

    summary = Column(
        Text,
        nullable=False
    )

    severity = Column(
        String(20),
        nullable=False
    )

    root_cause = Column(
        Text,
        nullable=False
    )

    recommendations = Column(
        JSONB,
        nullable=False
    )

    confidence = Column(
        Float,
        nullable=False
    )

    should_create_incident = Column(
        Boolean,
        nullable=False
    )

    analyzed_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now()
    )

    webhook_log = relationship(
        "WebhookLog",
        back_populates="ai_analysis"
    )