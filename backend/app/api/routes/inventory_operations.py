from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.database.database import get_db
from app.models.inventory_stock import InventoryStock
from app.models.stock_movement import StockMovement
from app.schemas.inventory_operations import (
    StockAdjustmentRequest,
    StockOperationRequest,
    StockTransferRequest,
)
from app.services.inventory_service import (
    change_stock,
    get_inventory_by_product_warehouse,
)


router = APIRouter(
    prefix="/api/inventory",
    tags=["Inventory Operations"],
)


# ============================================================
# STOCK IN
# ============================================================

@router.post("/stock-in")
def stock_in(
    data: StockOperationRequest,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "admin",
            "warehouse_manager",
            "inventory_staff",
        )
    ),
):
    inventory, movement = change_stock(
        db=db,
        product_id=data.product_id,
        warehouse_id=data.warehouse_id,
        quantity=data.quantity,
        movement_type="STOCK_IN",
        reference=data.reference,
        notes=data.notes,
        unit_cost=data.unit_cost,
    )

    return {
        "message": "Stock added successfully",
        "inventory": inventory,
        "movement": movement,
    }


# ============================================================
# STOCK OUT
# ============================================================

@router.post("/stock-out")
def stock_out(
    data: StockOperationRequest,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "admin",
            "warehouse_manager",
            "inventory_staff",
        )
    ),
):
    inventory, movement = change_stock(
        db=db,
        product_id=data.product_id,
        warehouse_id=data.warehouse_id,
        quantity=data.quantity,
        movement_type="STOCK_OUT",
        reference=data.reference,
        notes=data.notes,
        unit_cost=data.unit_cost,
    )

    return {
        "message": "Stock removed successfully",
        "inventory": inventory,
        "movement": movement,
    }


# ============================================================
# DAMAGED STOCK
# ============================================================

@router.post("/damaged")
def damaged_stock(
    data: StockOperationRequest,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "admin",
            "warehouse_manager",
            "inventory_staff",
        )
    ),
):
    inventory, movement = change_stock(
        db=db,
        product_id=data.product_id,
        warehouse_id=data.warehouse_id,
        quantity=data.quantity,
        movement_type="DAMAGED",
        reference=data.reference,
        notes=data.notes,
    )

    return {
        "message": "Damaged stock recorded successfully",
        "inventory": inventory,
        "movement": movement,
    }


# ============================================================
# STOCK ADJUSTMENT
# ============================================================

@router.post("/adjust")
def adjust_stock(
    data: StockAdjustmentRequest,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "admin",
            "warehouse_manager",
            "inventory_staff",
        )
    ),
):
    inventory = get_inventory_by_product_warehouse(
        db,
        data.product_id,
        data.warehouse_id,
    )

    if not inventory:
        return {
            "message": "Inventory record not found"
        }

    old_quantity = inventory.quantity
    difference = data.new_quantity - old_quantity

    inventory.quantity = data.new_quantity

    movement = StockMovement(
        product_id=data.product_id,
        warehouse_id=data.warehouse_id,
        movement_type="ADJUSTMENT",
        quantity=abs(difference),
        notes=(
            f"{data.notes or 'Stock adjustment'} "
            f"(old: {old_quantity}, new: {data.new_quantity})"
        ),
    )

    db.add(movement)
    db.commit()

    db.refresh(inventory)
    db.refresh(movement)

    return {
        "message": "Stock adjusted successfully",
        "old_quantity": old_quantity,
        "new_quantity": inventory.quantity,
        "difference": difference,
        "inventory": inventory,
        "movement": movement,
    }


# ============================================================
# STOCK TRANSFER
# ============================================================

@router.post("/transfer")
def transfer_stock(
    data: StockTransferRequest,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "admin",
            "warehouse_manager",
            "inventory_staff",
        )
    ),
):
    if data.from_warehouse_id == data.to_warehouse_id:
        return {
            "message": "Source and destination warehouse must be different"
        }

    source = get_inventory_by_product_warehouse(
        db,
        data.product_id,
        data.from_warehouse_id,
    )

    if not source:
        return {
            "message": "Source inventory record not found"
        }

    if source.quantity < data.quantity:
        return {
            "message": f"Insufficient stock. Available: {source.quantity}"
        }

    destination = get_inventory_by_product_warehouse(
        db,
        data.product_id,
        data.to_warehouse_id,
    )

    if not destination:
        destination = InventoryStock(
            product_id=data.product_id,
            warehouse_id=data.to_warehouse_id,
            quantity=0,
            minimum_stock_level=5,
        )

        db.add(destination)
        db.flush()

    source.quantity -= data.quantity
    destination.quantity += data.quantity

    outbound_movement = StockMovement(
        product_id=data.product_id,
        warehouse_id=data.from_warehouse_id,
        movement_type="TRANSFER_OUT",
        quantity=data.quantity,
        notes=data.notes,
    )

    inbound_movement = StockMovement(
        product_id=data.product_id,
        warehouse_id=data.to_warehouse_id,
        movement_type="TRANSFER_IN",
        quantity=data.quantity,
        notes=data.notes,
    )

    db.add(outbound_movement)
    db.add(inbound_movement)

    db.commit()

    db.refresh(source)
    db.refresh(destination)

    return {
        "message": "Stock transferred successfully",
        "transferred_quantity": data.quantity,
        "source": source,
        "destination": destination,
    }