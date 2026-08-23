from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class InventoryCreate(BaseModel):
    product_id: int
    warehouse_id: int
    quantity: int = Field(default=0, ge=0)
    minimum_stock_level: int = Field(default=5, ge=0)
    location: str | None = None


class InventoryUpdate(BaseModel):
    minimum_stock_level: int | None = Field(default=None, ge=0)
    location: str | None = None


class InventoryResponse(BaseModel):
    id: int
    product_id: int
    warehouse_id: int
    quantity: int
    minimum_stock_level: int
    location: str | None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)