from datetime import datetime

from sqlalchemy.orm import Session

from app.models.incident import Incident
from app.models.user import User
from app.utils.activity_logger import log_activity
from app.utils.permission import (
    can_assign_incident,
    can_create_incident,
    can_delete_incident,
    can_resolve_incident,
    can_update_incident,
    can_view_incidents,
    deny,
    ensure_team_scope,
    is_admin,
)


def create_incident(
    data,
    db: Session,
    current_user
):
    if not can_create_incident(current_user):
        deny("You do not have permission to create incidents")

    ensure_team_scope(current_user, data.team_id)

    if data.assigned_to is not None:
        assignee = db.query(User).filter(User.id == data.assigned_to).first()
        if assignee is None:
            deny("Assigned user not found")
        ensure_team_scope(current_user, assignee.team_id)

    incident = Incident(
        title=data.title,
        description=data.description,
        severity=data.severity,
        status="OPEN",
        source=data.source,
        created_by=current_user.id,
        assigned_to=data.assigned_to,
        team_id=data.team_id,
    )

    db.add(incident)
    db.commit()
    db.refresh(incident)

    log_activity(
        db=db,
        action="CREATE_INCIDENT",
        user_id=current_user.id,
        incident_id=incident.id,
        details=f"Created incident '{incident.title}'"
    )

    return incident


def get_all_incidents(
    db: Session,
    current_user
):
    if not can_view_incidents(current_user):
        deny("You do not have permission to view incidents")

    query = db.query(Incident)
    if not is_admin(current_user):
        query = query.filter(Incident.team_id == current_user.team_id)

    return query.order_by(Incident.created_at.desc()).all()


def get_incident_by_id(
    incident_id: int,
    db: Session,
    current_user=None
):
    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id)
        .first()
    )

    if incident is not None and current_user is not None:
        if not can_view_incidents(current_user):
            deny("You do not have permission to view incidents")
        ensure_team_scope(current_user, incident.team_id)

    return incident


def update_incident(
    incident,
    data,
    db: Session,
    current_user
):
    if not can_update_incident(current_user):
        deny("You do not have permission to update incidents")

    ensure_team_scope(current_user, incident.team_id)

    update_data = data.model_dump(
        exclude_unset=True
    )
    action = "UPDATE_INCIDENT"
    details = f"Updated incident '{incident.title}'"

    if "assigned_to" in update_data:
        if not can_assign_incident(current_user):
            deny("You do not have permission to assign incidents")
        if update_data["assigned_to"] is not None:
            assignee = db.query(User).filter(User.id == update_data["assigned_to"]).first()
            if assignee is None:
                deny("Assigned user not found")
            ensure_team_scope(current_user, assignee.team_id)
        action = "ASSIGN_INCIDENT"
        details = f"Assigned incident '{incident.title}' to user {update_data['assigned_to']}"

    if "status" in update_data and update_data["status"] == "RESOLVED":
        if not can_resolve_incident(current_user):
            deny("You do not have permission to resolve incidents")
        action = "RESOLVE_INCIDENT"
        details = f"Resolved incident '{incident.title}'"

    for key, value in update_data.items():
        setattr(
            incident,
            key,
            value
        )

    incident.updated_at = datetime.utcnow()

    if incident.status == "RESOLVED":
        incident.resolved_at = datetime.utcnow()

    db.commit()
    db.refresh(incident)

    log_activity(
        db=db,
        action=action,
        user_id=current_user.id,
        incident_id=incident.id,
        details=details
    )

    return incident


def resolve_incident(
    incident,
    db: Session,
    current_user
):
    if not can_resolve_incident(current_user):
        deny("You do not have permission to resolve incidents")

    ensure_team_scope(current_user, incident.team_id)

    incident.status = "RESOLVED"
    incident.resolved_at = datetime.utcnow()

    db.commit()
    db.refresh(incident)

    log_activity(
        db=db,
        action="RESOLVE_INCIDENT",
        user_id=current_user.id,
        incident_id=incident.id,
        details=f"Resolved incident '{incident.title}'"
    )

    return incident


def delete_incident(
    incident,
    db: Session,
    current_user
):
    if not can_delete_incident(current_user):
        deny("You do not have permission to delete incidents")

    ensure_team_scope(current_user, incident.team_id)

    log_activity(
        db=db,
        action="DELETE_INCIDENT",
        user_id=current_user.id,
        incident_id=incident.id,
        details=f"Deleted incident '{incident.title}'"
    )

    db.delete(incident)
    db.commit()

    return True
