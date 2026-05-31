from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)

    role_name = Column(
        String(100),
        nullable=False
    )

    team_id = Column(
        Integer,
        ForeignKey("teams.id")
    )

    team = relationship(
        "Team",
        back_populates="roles"
    )