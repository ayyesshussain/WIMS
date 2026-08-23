from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)
    unit_price: Decimal = Field(gt=0)


class SaleItemResponse(BaseModel):
    id: int
    sale_id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    total_price: Decimal

    model_config = ConfigDict(from_attributes=True)


class SaleCreate(BaseModel):
    customer_name: str | None = None

    # NEW
    warehouse_id: int

    reference: str | None = None
    notes: str | None = None

    items: list[SaleItemCreate] = Field(
        min_length=1
    )


class SaleResponse(BaseModel):
    id: int
    customer_name: str | None

    # NEW
    warehouse_id: int

    reference: str | None
    total_amount: Decimal
    status: str
    notes: str | None
    created_at: datetime
    items: list[SaleItemResponse] = []

    model_config = ConfigDict(from_attributes=True)