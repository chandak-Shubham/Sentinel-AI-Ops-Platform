from pydantic import BaseModel


class LogCreate(BaseModel):
    service_name: str
    source: str | None = None
    event_type: str
    message: str


class LogResponse(BaseModel):
    id: int
    service_name: str
    source: str | None = None
    event_type: str
    log_level: str
    message: str

    class Config:
        from_attributes = True