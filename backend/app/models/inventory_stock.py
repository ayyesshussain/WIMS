from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class InventoryStock(Base):
    __tablename__ = "inventory_stock"

    __table_args__ = (
        UniqueConstraint(
            "product_id",
            "warehouse_id",
            name="uq_product_warehouse"
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"),
        nullable=False,
        index=True
    )

    warehouse_id: Mapped[int] = mapped_column(
        ForeignKey("warehouses.id"),
        nullable=False,
        index=True
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
    )

    minimum_stock_level: Mapped[int] = mapped_column(
        Integer,
        default=5,
        nullable=False
    )

    location: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )