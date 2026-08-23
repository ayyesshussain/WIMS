from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Numeric,
    String,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.database.database import Base


if TYPE_CHECKING:
    from app.models.purchase_item import PurchaseItem


class Purchase(Base):
    __tablename__ = "purchases"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    supplier_id: Mapped[int] = mapped_column(
        ForeignKey("suppliers.id"),
        nullable=False,
        index=True,
    )

    # NEW:
    # Warehouse that will receive this purchase
    warehouse_id: Mapped[int] = mapped_column(
        ForeignKey("warehouses.id"),
        nullable=False,
        index=True,
    )

    reference: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=0,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="PENDING",
        nullable=False,
    )

    notes: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    items: Mapped[list["PurchaseItem"]] = relationship(
        "PurchaseItem",
        back_populates="purchase",
        cascade="all, delete-orphan",
    )