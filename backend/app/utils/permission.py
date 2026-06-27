from fastapi import HTTPException

def check_permission(
    user,
    permission_name
):

    permissions = [
        p.permission_name
        for p in user.role.permissions
    ]

    if permission_name not in permissions:
        raise HTTPException(
            status_code=403,
            detail="Permission denied"
        )