from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

from app.core.permissions import (
    get_current_user,
    require_roles,
)
from app.database.database import get_db
from app.schemas.warehouse import (
    WarehouseCreate,
    WarehouseResponse,
    WarehouseUpdate,
)
from app.services.warehouse_service import (
    create_warehouse,
    delete_warehouse,
    get_warehouse,
    get_warehouses,
    update_warehouse,
)


router = APIRouter(
    prefix="/api/warehouses",
    tags=["Warehouses"]
)


@router.get(
    "",
    response_model=list[WarehouseResponse]
)
def list_warehouses(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_warehouses(db)


@router.get(
    "/{warehouse_id}",
    response_model=WarehouseResponse
)
def get_single_warehouse(
    warehouse_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    warehouse = get_warehouse(
        db,
        warehouse_id
    )

    if not warehouse:
        raise HTTPException(
            status_code=404,
            detail="Warehouse not found"
        )

    return warehouse


@router.post(
    "",
    response_model=WarehouseResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_warehouse(
    data: WarehouseCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("admin")
    )
):
    return create_warehouse(
        db,
        data
    )


@router.put(
    "/{warehouse_id}",
    response_model=WarehouseResponse
)
def update_existing_warehouse(
    warehouse_id: int,
    data: WarehouseUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("admin")
    )
):
    warehouse = get_warehouse(
        db,
        warehouse_id
    )

    if not warehouse:
        raise HTTPException(
            status_code=404,
            detail="Warehouse not found"
        )

    return update_warehouse(
        db,
        warehouse,
        data
    )


@router.delete(
    "/{warehouse_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_existing_warehouse(
    warehouse_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("admin")
    )
):
    warehouse = get_warehouse(
        db,
        warehouse_id
    )

    if not warehouse:
        raise HTTPException(
            status_code=404,
            detail="Warehouse not found"
        )

    delete_warehouse(
        db,
        warehouse
    )

    return None