from sqlalchemy.orm import Session
from app.models.user import User
from app.models.team import Team
from app.models.role import Role
from app.utils.security import (verify_password,hash_password)
from app.utils.jwt import create_access_token


def login_user(
    email: str,
    password: str,
    db: Session
):
    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        return None

    if not verify_password(
        password,
        user.password_hash
    ):
        return None

    token = create_access_token(
        {
            "user_id": user.id,
            "email": user.email,
            "role": user.role.role_name,
            "team_id": user.team_id
        }
    )

    return token


def create_user(
    full_name: str,
    email: str,
    password: str,
    role_id: int,
    team_id: int,
    db: Session
):
    existing_user = db.query(User).filter(
        User.email == email
    ).first()

    if existing_user:
        return None

    team = db.query(Team).filter(
        Team.id == team_id
    ).first()

    if not team:
        return None

    if role_id is None and team.team_name.lower() == "admin":
        role = db.query(Role).filter(
            Role.role_name == "System Admin",
            Role.team_id == team_id
        ).first()
    else:
        role = db.query(Role).filter(
            Role.id == role_id,
            Role.team_id == team_id
        ).first()

    if not role:
        return None

    hashed_password = hash_password(password)

    new_user = User(
        full_name=full_name,
        email=email,
        password_hash=hashed_password,
        role_id=role.id,
        team_id=team_id
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def get_or_create_demo_user(db: Session):
    email = "demo@sentinel.ai"
    user = db.query(User).filter(User.email == email).first()
    if user:
        return user

    # Create dummy Demo team
    team = db.query(Team).filter(Team.team_name == "Demo").first()
    if not team:
        team = Team(
            team_name="Demo",
            description="Demo Team"
        )
        db.add(team)
        db.commit()
        db.refresh(team)

    # Create System Admin role for the team
    role = db.query(Role).filter(
        Role.role_name == "System Admin",
        Role.team_id == team.id
    ).first()
    if not role:
        role = Role(
            role_name="System Admin",
            team_id=team.id
        )
        db.add(role)
        db.commit()
        db.refresh(role)

    # Create Demo user
    hashed_password = hash_password("demo_password_123")
    demo_user = User(
        full_name="Demo User",
        email=email,
        password_hash=hashed_password,
        role_id=role.id,
        team_id=team.id
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)

    return demo_user
