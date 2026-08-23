from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.database.database import get_db

from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserUpdate,
)

from app.services.user_service import (
    create_user,
    list_users,
    update_user,
)


router = APIRouter(
    prefix="/api/users",
    tags=["Users"],
)


@router.get(
    "",
    response_model=list[UserResponse],
)
def get_users(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("admin")
    ),
):
    return list_users(db)


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_staff_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("admin")
    ),
):
    return create_user(
        db,
        data,
    )


@router.put(
    "/{user_id}",
    response_model=UserResponse,
)
def update_staff_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("admin")
    ),
):
    return update_user(
        db,
        user_id,
        data,
    )