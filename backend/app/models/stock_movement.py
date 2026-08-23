from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class StockMovement(Base):
    __tablename__ = "stock_movements"

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

    movement_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        index=True
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    unit_cost: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2),
        nullable=True
    )

    reference: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    notes: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )