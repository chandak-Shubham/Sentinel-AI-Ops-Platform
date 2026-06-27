from sqlalchemy import Column, Integer, String, Text, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String(100),nullable=False,unique=True)
    description = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True),server_default=func.now())
    roles=relationship("Role", back_populates="team")
    users = relationship("User",back_populates="team")
    incidents = relationship(
        "Incident",
        back_populates="team"
    )