from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.database.database import get_db
from app.schemas.inventory import (
    InventoryCreate,
    InventoryResponse,
    InventoryUpdate,
)
from app.services.inventory_service import (
    create_inventory,
    delete_inventory,
    get_inventory,
    list_inventory,
    update_inventory,
)

router = APIRouter(
    prefix="/api/inventory",
    tags=["Inventory"],
)


@router.get(
    "",
    response_model=list[InventoryResponse],
)
def list_inventory_records(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "admin",
            "warehouse_manager",
            "inventory_staff",
            "sales_staff",
        )
    ),
):
    return list_inventory(db)


@router.get(
    "/{inventory_id}",
    response_model=InventoryResponse,
)
def get_inventory_record(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "admin",
            "warehouse_manager",
            "inventory_staff",
            "sales_staff",
        )
    ),
):
    return get_inventory(db, inventory_id)


@router.post(
    "",
    response_model=InventoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_inventory_record(
    data: InventoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "admin",
            "warehouse_manager",
            "inventory_staff",
        )
    ),
):
    return create_inventory(db, data)


@router.put(
    "/{inventory_id}",
    response_model=InventoryResponse,
)
def update_inventory_record(
    inventory_id: int,
    data: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "admin",
            "warehouse_manager",
            "inventory_staff",
        )
    ),
):
    return update_inventory(db, inventory_id, data)


@router.delete(
    "/{inventory_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_inventory_record(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("admin")
    ),
):
    delete_inventory(db, inventory_id)