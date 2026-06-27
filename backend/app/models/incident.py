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


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)
    description = Column(Text)

    severity = Column(String(20), nullable=False)
    status = Column(
        String(20),
        nullable=False,
        default="OPEN"
    )
    source = Column(String(100))

    created_by = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL")
    )

    assigned_to = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL")
    )

    team_id = Column(
        Integer,
        ForeignKey("teams.id", ondelete="SET NULL")
    )

    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    resolved_at = Column(
        TIMESTAMP(timezone=True),
        nullable=True
    )

    creator = relationship(
        "User",
        foreign_keys=[created_by],
        back_populates="created_incidents"
    )

    assignee = relationship(
        "User",
        foreign_keys=[assigned_to],
        back_populates="assigned_incidents"
    )

    team = relationship(
    "Team",
    back_populates="incidents"
    )

    activity_logs = relationship(
    "ActivityLog",
    back_populates="incident"
    )