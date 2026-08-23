from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True
    )

    sku: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )

    barcode: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )

    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id"),
        nullable=False
    )

    purchase_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    selling_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    unit: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="piece"
    )

    is_active: Mapped[bool] = mapped_column(
        default=True,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )