from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.supplier import (
    SupplierCreate,
    SupplierResponse,
    SupplierUpdate,
)
from app.services.supplier_service import (
    create_supplier,
    delete_supplier,
    get_supplier,
    list_suppliers,
    update_supplier,
)
from app.core.permissions import (
    get_current_user,
    require_roles,
)


router = APIRouter(
    prefix="/api/suppliers",
    tags=["Suppliers"],
)


@router.get(
    "",
    response_model=list[SupplierResponse]
)
def list_all_suppliers(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return list_suppliers(db)


@router.post(
    "",
    response_model=SupplierResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_supplier(
    data: SupplierCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
    require_roles(
        "admin",
        "warehouse_manager",
    )
),
):
    return create_supplier(db, data)


@router.get(
    "/{supplier_id}",
    response_model=SupplierResponse
)
def get_single_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    supplier = get_supplier(db, supplier_id)

    if not supplier:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )

    return supplier


@router.put(
    "/{supplier_id}",
    response_model=SupplierResponse
)
def update_existing_supplier(
    supplier_id: int,
    data: SupplierUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
    require_roles(
        "admin",
        "warehouse_manager",
    )
),
):
    return update_supplier(
        db,
        supplier_id,
        data
    )


@router.delete(
    "/{supplier_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_existing_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
    require_roles("admin")
),
):
    delete_supplier(
        db,
        supplier_id
    )

    return None