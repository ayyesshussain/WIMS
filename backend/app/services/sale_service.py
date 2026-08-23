from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.inventory_stock import InventoryStock
from app.models.product import Product
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.models.stock_movement import StockMovement
from app.models.warehouse import Warehouse

from app.services.audit_service import create_audit_log


def create_sale(
    db: Session,
    sale_data,
    user_id: int | None = None,
):
    # ========================================================
    # 1. VALIDATE WAREHOUSE
    # ========================================================

    warehouse = db.get(
        Warehouse,
        sale_data.warehouse_id,
    )

    if not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Warehouse not found",
        )

    if not warehouse.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Warehouse is inactive",
        )

    # ========================================================
    # 2. DUPLICATE REFERENCE CHECK
    # ========================================================

    if sale_data.reference:
        existing_sale = db.scalar(
            select(Sale).where(
                Sale.reference == sale_data.reference
            )
        )

        if existing_sale:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Sale reference "
                    f"'{sale_data.reference}' already exists"
                ),
            )

    # ========================================================
    # 3. VALIDATE ALL ITEMS + CHECK INVENTORY
    # ========================================================

    validated_items = []
    total_amount = Decimal("0.00")

    for item_data in sale_data.items:
        product = db.get(
            Product,
            item_data.product_id,
        )

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"Product "
                    f"{item_data.product_id} not found"
                ),
            )

        if not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Product "
                    f"{item_data.product_id} is inactive"
                ),
            )

        inventory = db.scalar(
            select(InventoryStock).where(
                InventoryStock.product_id
                == item_data.product_id,

                InventoryStock.warehouse_id
                == sale_data.warehouse_id,
            )
        )

        if not inventory:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"No inventory found for "
                    f"product {item_data.product_id} "
                    f"in warehouse "
                    f"{sale_data.warehouse_id}"
                ),
            )

        if inventory.quantity < item_data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Insufficient stock for product "
                    f"{item_data.product_id}. "
                    f"Available: {inventory.quantity}, "
                    f"requested: {item_data.quantity}"
                ),
            )

        total_price = (
            Decimal(item_data.quantity)
            * item_data.unit_price
        )

        total_amount += total_price

        validated_items.append(
            {
                "item_data": item_data,
                "inventory": inventory,
                "total_price": total_price,
            }
        )

    try:
        # ====================================================
        # 4. CREATE SALE
        # ====================================================

        sale = Sale(
            customer_name=sale_data.customer_name,
            warehouse_id=sale_data.warehouse_id,
            reference=sale_data.reference,
            total_amount=total_amount,
            status="COMPLETED",
            notes=sale_data.notes,
        )

        db.add(sale)
        db.flush()

        # ====================================================
        # 5. CREATE ITEMS + DEDUCT STOCK + MOVEMENTS
        # ====================================================

        for entry in validated_items:
            item_data = entry["item_data"]
            inventory = entry["inventory"]
            total_price = entry["total_price"]

            sale_item = SaleItem(
                sale_id=sale.id,
                product_id=item_data.product_id,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                total_price=total_price,
            )

            db.add(sale_item)

            inventory.quantity -= (
                item_data.quantity
            )

            movement = StockMovement(
                product_id=item_data.product_id,
                warehouse_id=sale_data.warehouse_id,
                movement_type="STOCK_OUT",
                quantity=item_data.quantity,
                unit_cost=item_data.unit_price,
                reference=(
                    sale.reference
                    or f"SALE-{sale.id}"
                ),
                notes=(
                    f"Sale #{sale.id}"
                ),
            )

            db.add(movement)

        # ====================================================
        # 6. COMMIT EVERYTHING TOGETHER
        # ====================================================

        db.commit()
        db.refresh(sale)

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create sale",
        )

    # ========================================================
    # 7. AUDIT LOG
    # ========================================================

    create_audit_log(
        db=db,
        user_id=user_id,
        action="CREATE",
        entity="Sale",
        entity_id=sale.id,
        description=(
            f"Sale "
            f"{sale.reference or sale.id} "
            f"created from warehouse "
            f"{sale.warehouse_id}"
        ),
    )

    return sale


def get_all_sales(
    db: Session
):
    return (
        db.query(Sale)
        .order_by(Sale.id.desc())
        .all()
    )


def get_sale_by_id(
    db: Session,
    sale_id: int,
):
    return (
        db.query(Sale)
        .filter(
            Sale.id == sale_id
        )
        .first()
    )