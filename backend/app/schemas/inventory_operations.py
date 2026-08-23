from decimal import Decimal

from pydantic import BaseModel, Field


class StockOperationRequest(BaseModel):
    product_id: int
    warehouse_id: int

    quantity: int = Field(
        ...,
        gt=0
    )

    reference: str | None = None

    notes: str | None = None

    unit_cost: Decimal | None = None


class StockAdjustmentRequest(BaseModel):
    product_id: int
    warehouse_id: int

    new_quantity: int = Field(
        ...,
        ge=0
    )

    notes: str | None = None


class StockTransferRequest(BaseModel):
    product_id: int

    from_warehouse_id: int
    to_warehouse_id: int

    quantity: int = Field(
        ...,
        gt=0
    )

    notes: str | None = None