from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth_schema import (
    LoginRequest,
    TokenResponse,
    CreateUserRequest
)
from app.services.auth_service import (
    login_user,
    create_user
)
from app.utils.dependencies import get_optional_current_user
from app.models.user import User
from app.models.role import Role
from app.models.team import Team
from app.utils.permission import can_create_user, deny

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/login", response_model=TokenResponse)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    token = login_user(
        request.email,
        request.password,
        db
    )

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.post("/create-user")
def register_user(
    request: CreateUserRequest,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user)
):
    has_users = db.query(User).first() is not None
    if has_users and not can_create_user(current_user):
        deny("Only admins can create users")

    if not has_users:
        team = db.query(Team).filter(Team.id == request.team_id).first()
        role = None
        if request.role_id is not None:
            role = db.query(Role).filter(Role.id == request.role_id).first()
        if team and request.role_id is None and team.team_name.lower() == "admin":
            role = db.query(Role).filter(Role.team_id == team.id, Role.role_name == "System Admin").first()
        if not team or not role or team.team_name.lower() != "admin" or role.role_name.lower() != "system admin":
            deny("First user must be a System Admin in the Admin team")

    user = create_user(
        request.full_name,
        request.email,
        request.password,
        request.role_id,
        request.team_id,
        db
    )

    if not user:
        raise HTTPException(
            status_code=400,
            detail="User creation failed"
        )

    return {
        "message": "User created successfully"
    }
