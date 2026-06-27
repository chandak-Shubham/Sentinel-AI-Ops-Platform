from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.role_permission import RolePermission


class Permission(Base):
    __tablename__ = "permissions"
    id = Column(Integer,primary_key=True,index=True)
    permission_name = Column(String(100),unique=True,nullable=False)
    roles = relationship("Role",secondary=RolePermission.__table__,back_populates="permissions")