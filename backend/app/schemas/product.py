from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    sku: str = Field(min_length=1, max_length=50)
    barcode: str = Field(min_length=1, max_length=100)

    category_id: int

    purchase_price: Decimal = Field(
        ge=0,
        decimal_places=2
    )

    selling_price: Decimal = Field(
        ge=0,
        decimal_places=2
    )

    unit: str = Field(
        default="piece",
        min_length=1,
        max_length=30
    )


class ProductUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=150
    )

    sku: str | None = Field(
        default=None,
        min_length=1,
        max_length=50
    )

    barcode: str | None = Field(
        default=None,
        min_length=1,
        max_length=100
    )

    category_id: int | None = None

    purchase_price: Decimal | None = Field(
        default=None,
        ge=0,
        decimal_places=2
    )

    selling_price: Decimal | None = Field(
        default=None,
        ge=0,
        decimal_places=2
    )

    unit: str | None = Field(
        default=None,
        min_length=1,
        max_length=30
    )

    is_active: bool | None = None


class ProductResponse(BaseModel):
    id: int
    name: str
    sku: str
    barcode: str

    category_id: int

    purchase_price: Decimal
    selling_price: Decimal

    unit: str
    is_active: bool

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )