from fastapi import HTTPException


ENGINEER_ROLES = {
    "backend engineer",
    "frontend engineer",
    "devops engineer",
    "employee",
}


def get_role_name(user):
    return ((user.role.role_name if user and user.role else "") or "").strip().lower()


def get_team_name(user):
    return ((user.team.team_name if user and user.team else "") or "").strip().lower()


def is_admin(user):
    return get_team_name(user) == "admin" or get_role_name(user) == "system admin"


def is_team_lead(user):
    return get_role_name(user) == "team lead"


def is_engineer(user):
    return get_role_name(user) in ENGINEER_ROLES


def is_intern(user):
    return get_role_name(user) == "intern"


def deny(message="Permission denied"):
    raise HTTPException(status_code=403, detail=message)


def ensure_team_scope(user, team_id):
    if is_admin(user):
        return
    if team_id is None or user.team_id != team_id:
        deny("You can only access records for your own team")


def can_view_incidents(user):
    return is_admin(user) or is_team_lead(user) or is_engineer(user) or is_intern(user)


def can_create_incident(user):
    return is_admin(user) or is_team_lead(user) or is_engineer(user)


def can_update_incident(user):
    return is_admin(user) or is_team_lead(user) or is_engineer(user)


def can_delete_incident(user):
    return is_admin(user) or is_team_lead(user)


def can_assign_incident(user):
    return is_admin(user) or is_team_lead(user) or is_engineer(user)


def can_resolve_incident(user):
    return is_admin(user) or is_team_lead(user) or is_engineer(user)


def can_create_user(user):
    return is_admin(user)


def can_view_logs(user):
    return is_admin(user) or is_team_lead(user)

def check_permission(
    user,
    permission_name
):
    if is_admin(user):
        return

    permissions = [
        p.permission_name
        for p in user.role.permissions
    ]

    if permission_name not in permissions:
        raise HTTPException(
            status_code=403,
            detail="Permission denied"
        )
