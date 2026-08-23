from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.inventory_stock import InventoryStock
from app.models.product import Product
from app.models.warehouse import Warehouse
from app.schemas.inventory import InventoryCreate, InventoryUpdate
from app.models.stock_movement import StockMovement


def list_inventory(db: Session):
    return db.scalars(
        select(InventoryStock).order_by(InventoryStock.id.desc())
    ).all()


def get_inventory(db: Session, inventory_id: int):
    return db.scalar(
        select(InventoryStock).where(
            InventoryStock.id == inventory_id
        )
    )


def create_inventory(db: Session, data: InventoryCreate):

    product = db.get(Product, data.product_id)

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    warehouse = db.get(Warehouse, data.warehouse_id)

    if not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Warehouse not found"
        )

    existing = db.scalar(
        select(InventoryStock).where(
            InventoryStock.product_id == data.product_id,
            InventoryStock.warehouse_id == data.warehouse_id
        )
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Inventory already exists for this product and warehouse"
        )

    inventory = InventoryStock(
        product_id=data.product_id,
        warehouse_id=data.warehouse_id,
        quantity=data.quantity,
        minimum_stock_level=data.minimum_stock_level,
        location=data.location,
    )

    db.add(inventory)
    db.commit()
    db.refresh(inventory)

    return inventory


def update_inventory(
    db: Session,
    inventory_id: int,
    data: InventoryUpdate
):
    inventory = get_inventory(db, inventory_id)

    if not inventory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory record not found"
        )

    if data.minimum_stock_level is not None:
        inventory.minimum_stock_level = data.minimum_stock_level

    if data.location is not None:
        inventory.location = data.location

    db.commit()
    db.refresh(inventory)

    return inventory


def delete_inventory(db: Session, inventory_id: int):

    inventory = get_inventory(db, inventory_id)

    if not inventory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory record not found"
        )

    db.delete(inventory)
    db.commit()


# ============================================================
# STOCK OPERATIONS
# ============================================================

def get_inventory_by_product_warehouse(
    db: Session,
    product_id: int,
    warehouse_id: int
):
    return db.scalar(
        select(InventoryStock).where(
            InventoryStock.product_id == product_id,
            InventoryStock.warehouse_id == warehouse_id
        )
    )


def stock_in(
    db: Session,
    product_id: int,
    warehouse_id: int,
    quantity: int,
    reference: str | None = None,
    notes: str | None = None,
):
    if quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than zero"
        )

    inventory = get_inventory_by_product_warehouse(
        db,
        product_id,
        warehouse_id
    )

    if not inventory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory record not found"
        )

    inventory.quantity += quantity

    movement = StockMovement(
        product_id=product_id,
        warehouse_id=warehouse_id,
        movement_type="STOCK_IN",
        quantity=quantity,
        reference=reference,
        notes=notes,
    )

    db.add(movement)
    db.commit()

    db.refresh(inventory)
    db.refresh(movement)

    return inventory, movement


def stock_out(
    db: Session,
    product_id: int,
    warehouse_id: int,
    quantity: int,
    reference: str | None = None,
    notes: str | None = None,
):
    if quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than zero"
        )

    inventory = get_inventory_by_product_warehouse(
        db,
        product_id,
        warehouse_id
    )

    if not inventory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory record not found"
        )

    if inventory.quantity < quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock. Available stock: {inventory.quantity}"
        )

    inventory.quantity -= quantity

    movement = StockMovement(
        product_id=product_id,
        warehouse_id=warehouse_id,
        movement_type="STOCK_OUT",
        quantity=quantity,
        reference=reference,
        notes=notes,
    )

    db.add(movement)
    db.commit()

    db.refresh(inventory)
    db.refresh(movement)

    return inventory, movement


def damaged_stock(
    db: Session,
    product_id: int,
    warehouse_id: int,
    quantity: int,
    reference: str | None = None,
    notes: str | None = None,
):
    if quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than zero"
        )

    inventory = get_inventory_by_product_warehouse(
        db,
        product_id,
        warehouse_id
    )

    if not inventory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory record not found"
        )

    if inventory.quantity < quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock. Available stock: {inventory.quantity}"
        )

    inventory.quantity -= quantity

    movement = StockMovement(
        product_id=product_id,
        warehouse_id=warehouse_id,
        movement_type="DAMAGED",
        quantity=quantity,
        reference=reference,
        notes=notes,
    )

    db.add(movement)
    db.commit()

    db.refresh(inventory)
    db.refresh(movement)

    return inventory, movement

def change_stock(
    db: Session,
    product_id: int,
    warehouse_id: int,
    quantity: int,
    movement_type: str,
    reference: str | None = None,
    notes: str | None = None,
    unit_cost=None,
):
    if quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than zero"
        )

    allowed_types = {
        "STOCK_IN",
        "STOCK_OUT",
        "DAMAGED",
        "ADJUSTMENT_IN",
        "ADJUSTMENT_OUT",
    }

    if movement_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid movement type. Allowed: {', '.join(allowed_types)}"
        )

    inventory = get_inventory_by_product_warehouse(
        db,
        product_id,
        warehouse_id
    )

    if not inventory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory record not found"
        )

    if movement_type in {"STOCK_IN", "ADJUSTMENT_IN"}:
        inventory.quantity += quantity

    elif movement_type in {
        "STOCK_OUT",
        "DAMAGED",
        "ADJUSTMENT_OUT"
    }:
        if inventory.quantity < quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock. Available stock: {inventory.quantity}"
            )

        inventory.quantity -= quantity

    movement = StockMovement(
        product_id=product_id,
        warehouse_id=warehouse_id,
        movement_type=movement_type,
        quantity=quantity,
        unit_cost=unit_cost,
        reference=reference,
        notes=notes,
    )

    db.add(movement)
    db.commit()

    db.refresh(inventory)
    db.refresh(movement)

    return inventory, movement