from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class StockMovementCreate(BaseModel):
    product_id: int
    warehouse_id: int

    movement_type: str = Field(
        ...,
        min_length=3,
        max_length=30
    )

    quantity: int = Field(
        ...,
        gt=0
    )

    unit_cost: Decimal | None = None

    reference: str | None = None

    notes: str | None = None


class StockMovementUpdate(BaseModel):
    movement_type: str | None = Field(
        default=None,
        min_length=3,
        max_length=30
    )

    reference: str | None = None

    notes: str | None = None


class StockMovementResponse(BaseModel):
    id: int
    product_id: int
    warehouse_id: int
    movement_type: str
    quantity: int
    unit_cost: Decimal | None
    reference: str | None
    notes: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)