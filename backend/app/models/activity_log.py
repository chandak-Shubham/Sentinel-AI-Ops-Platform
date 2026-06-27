from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    TIMESTAMP
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)

    action = Column(String(100), nullable=False)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL")
    )

    incident_id = Column(
        Integer,
        ForeignKey("incidents.id", ondelete="SET NULL")
    )

    details = Column(Text)

    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now()
    )

    user = relationship(
        "User",
        back_populates="activity_logs"
    )

    incident = relationship(
        "Incident",
        back_populates="activity_logs"
    )