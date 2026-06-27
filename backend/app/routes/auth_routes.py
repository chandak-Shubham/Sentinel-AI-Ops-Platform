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
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.utils.permission import check_permission

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


# TEMPORARY: No authentication so that the first admin can be created.
@router.post("/create-user")
def register_user(
    request: CreateUserRequest,
    db: Session = Depends(get_db)
):
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