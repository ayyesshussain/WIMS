from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    company_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True
    )

    contact_person: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    phone: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True
    )

    email: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True
    )

    address: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
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