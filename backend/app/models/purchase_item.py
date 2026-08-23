from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.purchase import Purchase


class PurchaseItem(Base):
    __tablename__ = "purchase_items"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    purchase_id: Mapped[int] = mapped_column(
        ForeignKey("purchases.id"),
        nullable=False,
        index=True
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"),
        nullable=False,
        index=True
    )

    quantity: Mapped[int] = mapped_column(
        nullable=False
    )

    unit_cost: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    total_cost: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    purchase: Mapped["Purchase"] = relationship(
        "Purchase",
        back_populates="items"
    )