from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.core.permissions import get_current_user

from app.database.database import get_db
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    UserResponse,
)
from app.services.auth_service import (
    authenticate_user,
    create_user_token,
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post(
    "/login",
    response_model=LoginResponse
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):

    user = authenticate_user(
        db,
        data.email,
        data.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_user_token(user)

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            role=user.role,
            is_active=user.is_active
        )
    )
@router.get("/me")
def get_me(
    current_user=Depends(get_current_user)
):
    return current_user