import logging
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.models.team import Team
from app.models.role import Role
from app.utils.security import hash_password
from app.core.config import DEFAULT_ADMIN_NAME, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD

logger = logging.getLogger(__name__)

def create_default_admin():
    db: Session = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count > 0:
            logger.info("Users already exist. Skipping default admin creation.")
            return

        logger.info("No users found. Creating default System Admin.")
        
        team = db.query(Team).filter(Team.team_name == "Admin").first()
        role = db.query(Role).filter(Role.role_name == "System Admin").first()

        if not team or not role:
            logger.error("Required 'Admin' team or 'System Admin' role not found. Ensure schema.sql has been executed.")
            return

        admin_user = User(
            full_name=DEFAULT_ADMIN_NAME,
            email=DEFAULT_ADMIN_EMAIL,
            password_hash=hash_password(DEFAULT_ADMIN_PASSWORD),
            role_id=role.id,
            team_id=team.id,
            is_active=True
        )

        db.add(admin_user)
        db.commit()
        logger.info(f"Default System Admin created with email: {DEFAULT_ADMIN_EMAIL}")

    except Exception as e:
        logger.error(f"Error creating default admin: {e}")
        db.rollback()
    finally:
        db.close()
