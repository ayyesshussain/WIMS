from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.stock_movement import StockMovement
from app.schemas.stock_movement import (
    StockMovementCreate,
    StockMovementResponse,
    StockMovementUpdate,
)
from app.core.permissions import (
    get_current_user,
    require_roles,
)

router = APIRouter(
    prefix="/api/stock-movements",
    tags=["Stock Movements"],
)


@router.get(
    "",
    response_model=list[StockMovementResponse]
)
def list_stock_movements(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = db.execute(
        select(StockMovement)
        .order_by(StockMovement.created_at.desc())
    )

    return result.scalars().all()


@router.post(
    "",
    response_model=StockMovementResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_stock_movement(
    data: StockMovementCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
        "admin",
        "warehouse_manager",
        "inventory_staff",
    )
),
):
    movement = StockMovement(
        product_id=data.product_id,
        warehouse_id=data.warehouse_id,
        movement_type=data.movement_type,
        quantity=data.quantity,
        unit_cost=data.unit_cost,
        reference=data.reference,
        notes=data.notes,
    )

    db.add(movement)
    db.commit()
    db.refresh(movement)

    return movement


@router.get(
    "/{movement_id}",
    response_model=StockMovementResponse
)
def get_stock_movement(
    movement_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    movement = db.get(StockMovement, movement_id)

    if not movement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock movement not found"
        )

    return movement


@router.put(
    "/{movement_id}",
    response_model=StockMovementResponse
)
def update_stock_movement(
    movement_id: int,
    data: StockMovementUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
    require_roles("admin")
),
):
    movement = db.get(StockMovement, movement_id)

    if not movement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock movement not found"
        )

    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(movement, field, value)

    db.commit()
    db.refresh(movement)

    return movement


@router.delete(
    "/{movement_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_stock_movement(
    movement_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
    require_roles("admin")
),
):
    movement = db.get(StockMovement, movement_id)

    if not movement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock movement not found"
        )

    db.delete(movement)
    db.commit()

    return None