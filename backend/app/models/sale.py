from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.sale_item import SaleItem

class Sale(Base):
    __tablename__ = "sales"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    customer_name: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True
    )

    warehouse_id: Mapped[int] = mapped_column(
        ForeignKey("warehouses.id"),
        nullable=False,
        index=True,
    )

    reference: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=0,
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="COMPLETED",
        nullable=False
    )

    notes: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    items: Mapped[list["SaleItem"]] = relationship(
        "SaleItem",
        back_populates="sale",
        cascade="all, delete-orphan"
    )