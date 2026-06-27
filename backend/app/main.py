from fastapi import FastAPI
import app.models
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth_routes import router as auth_router
from app.routes.incident_routes import router as incident_router
from app.routes.incident_routes import router as incident_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(incident_router)

@app.get("/")
def home():
    return {"message": "Sentinel Backend Running"}