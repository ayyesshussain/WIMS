from datetime import datetime

from pydantic import BaseModel, ConfigDict


class WarehouseCreate(BaseModel):
    name: str
    code: str
    address: str | None = None


class WarehouseUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    address: str | None = None
    is_active: bool | None = None


class WarehouseResponse(BaseModel):
    id: int
    name: str
    code: str
    address: str | None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)