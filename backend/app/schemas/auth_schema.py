from pydantic import BaseModel, EmailStr
from typing import Optional

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class CreateUserRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    team_id: int 
    role_id: Optional[int] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
