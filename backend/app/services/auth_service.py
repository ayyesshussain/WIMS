from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import (
    create_access_token,
    verify_password,
)


def authenticate_user(
    db: Session,
    email: str,
    password: str
):
    result = db.execute(
        select(User).where(User.email == email)
    )

    user = result.scalar_one_or_none()

    if not user:
        return None

    if not user.is_active:
        return None

    if not verify_password(
        password,
        user.password_hash
    ):
        return None

    return user


def create_user_token(user: User) -> str:
    return create_access_token(
        user_id=user.id,
        role=user.role
    )