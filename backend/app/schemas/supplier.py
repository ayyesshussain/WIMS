from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class SupplierBase(BaseModel):
    company_name: str
    contact_person: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None
    is_active: bool = True


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    company_name: str | None = None
    contact_person: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None
    is_active: bool | None = None


class SupplierResponse(SupplierBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)