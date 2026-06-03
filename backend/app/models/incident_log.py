from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    TIMESTAMP
)

from sqlalchemy.sql import func

from app.core.database import Base


class IncidentLog(Base):

    __tablename__ = "incident_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    incident_id = Column(
        Integer,
        ForeignKey("incidents.id"),
        nullable=False
    )

    action_type = Column(
        String(100),
        nullable=False
    )

    message = Column(Text)

    performed_by = Column(
        Integer,
        ForeignKey("users.id")
    )

    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now()
    )