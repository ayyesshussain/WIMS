from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.supplier import Supplier
from app.schemas.supplier import SupplierCreate, SupplierUpdate


def list_suppliers(db: Session):
    return db.scalars(
        select(Supplier).order_by(Supplier.id.desc())
    ).all()


def get_supplier(db: Session, supplier_id: int):
    return db.scalar(
        select(Supplier).where(
            Supplier.id == supplier_id
        )
    )


def create_supplier(
    db: Session,
    data: SupplierCreate
):
    existing = db.scalar(
        select(Supplier).where(
            Supplier.company_name == data.company_name
        )
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Supplier with this company name already exists"
        )

    supplier = Supplier(
        company_name=data.company_name,
        contact_person=data.contact_person,
        phone=data.phone,
        email=data.email,
        address=data.address,
        is_active=data.is_active,
    )

    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    return supplier


def update_supplier(
    db: Session,
    supplier_id: int,
    data: SupplierUpdate
):
    supplier = get_supplier(db, supplier_id)

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )

    if data.company_name is not None:
        supplier.company_name = data.company_name

    if data.contact_person is not None:
        supplier.contact_person = data.contact_person

    if data.phone is not None:
        supplier.phone = data.phone

    if data.email is not None:
        supplier.email = data.email

    if data.address is not None:
        supplier.address = data.address

    if data.is_active is not None:
        supplier.is_active = data.is_active

    db.commit()
    db.refresh(supplier)

    return supplier


def delete_supplier(
    db: Session,
    supplier_id: int
):
    supplier = get_supplier(db, supplier_id)

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )

    db.delete(supplier)
    db.commit()