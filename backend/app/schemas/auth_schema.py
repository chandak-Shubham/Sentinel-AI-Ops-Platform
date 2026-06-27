from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class CreateUserRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    team_id: int 
    role_id: int

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
