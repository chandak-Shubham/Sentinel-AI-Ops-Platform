from pydantic import BaseModel


class IncidentCreate(BaseModel):
    title: str
    description: str
    severity: str
    team_id: int


class IncidentUpdate(BaseModel):
    status: str


class IncidentResponse(BaseModel):
    id: int
    title: str
    description: str
    severity: str
    status: str

    class Config:
        from_attributes = True