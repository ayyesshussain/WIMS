from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str


class UserUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    role: str | None = None
    is_active: bool | None = None


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )