from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


ALLOWED_STAFF_ROLES = {
    "warehouse_manager",
    "inventory_staff",
    "sales_staff",
}


def list_users(db: Session):
    return db.scalars(
        select(User).order_by(User.id.desc())
    ).all()


def create_user(
    db: Session,
    data: UserCreate,
):
    if data.role not in ALLOWED_STAFF_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid staff role"
        )

    existing_user = db.scalar(
        select(User).where(
            User.email == data.email
        )
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists"
        )

    user = User(
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(
            data.password
        ),
        role=data.role,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def update_user(
    db: Session,
    user_id: int,
    data: UserUpdate,
):
    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if data.role is not None:
        if data.role not in ALLOWED_STAFF_ROLES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid staff role"
            )

        user.role = data.role

    if data.full_name is not None:
        user.full_name = data.full_name

    if data.email is not None:
        duplicate = db.scalar(
            select(User).where(
                User.email == data.email,
                User.id != user_id,
            )
        )

        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists"
            )

        user.email = data.email

    if data.is_active is not None:
        user.is_active = data.is_active

    db.commit()
    db.refresh(user)

    return user