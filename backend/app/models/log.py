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


class Log(Base):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True, index=True)
    service_name = Column(String(100), nullable=False)
    source = Column(String(100))
    event_type = Column(String(100), nullable=False)
    log_level = Column(String(20), nullable=False)
    message = Column(Text, nullable=False)
    incident_id = Column(
        Integer,
        ForeignKey("incidents.id"),
        nullable=True
    )
    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now()
    )