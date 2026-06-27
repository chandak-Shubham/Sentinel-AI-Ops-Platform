from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.role import Role
from app.models.team import Team

router = APIRouter(tags=["Options"])


@router.get("/teams")
def list_teams(
    db: Session = Depends(get_db)
):
    teams = db.query(Team).order_by(
        Team.team_name
    ).all()

    return [
        {
            "id": team.id,
            "name": team.team_name
        }
        for team in teams
    ]


@router.get("/roles/team/{team_id}")
def get_roles_by_team(
    team_id: int,
    db: Session = Depends(get_db)
):
    roles = db.query(Role).filter(
        Role.team_id == team_id
    ).order_by(
        Role.role_name
    ).all()

    return [
        {
            "id": role.id,
            "name": role.role_name
        }
        for role in roles
    ]
