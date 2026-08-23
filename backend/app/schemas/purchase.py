from datetime import datetime
from decimal import Decimal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


class PurchaseItemCreate(BaseModel):
    product_id: int

    quantity: int = Field(
        gt=0
    )

    unit_cost: Decimal = Field(
        gt=0
    )


class PurchaseCreate(BaseModel):
    supplier_id: int

    # NEW
    warehouse_id: int

    reference: str | None = None

    notes: str | None = None

    items: list[PurchaseItemCreate] = Field(
        min_length=1
    )


class PurchaseItemResponse(BaseModel):
    id: int

    purchase_id: int

    product_id: int

    quantity: int

    unit_cost: Decimal

    total_cost: Decimal

    model_config = ConfigDict(
        from_attributes=True
    )


class PurchaseResponse(BaseModel):
    id: int

    supplier_id: int

    # NEW
    warehouse_id: int

    reference: str | None

    total_amount: Decimal

    status: str

    notes: str | None

    created_at: datetime

    items: list[PurchaseItemResponse] = []

    model_config = ConfigDict(
        from_attributes=True
    )