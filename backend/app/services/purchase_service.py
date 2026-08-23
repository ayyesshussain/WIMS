from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.inventory_stock import InventoryStock
from app.models.product import Product
from app.models.purchase import Purchase
from app.models.purchase_item import PurchaseItem
from app.models.stock_movement import StockMovement
from app.models.supplier import Supplier
from app.models.warehouse import Warehouse

from app.schemas.purchase import PurchaseCreate
from app.services.audit_service import create_audit_log


# ============================================================
# LIST PURCHASES
# ============================================================

def list_purchases(db: Session):
    return db.scalars(
        select(Purchase)
        .order_by(Purchase.id.desc())
    ).all()


# ============================================================
# GET SINGLE PURCHASE
# ============================================================

def get_purchase(
    db: Session,
    purchase_id: int,
):
    return db.scalar(
        select(Purchase).where(
            Purchase.id == purchase_id
        )
    )


# ============================================================
# CREATE PURCHASE
# ============================================================

def create_purchase(
    db: Session,
    data: PurchaseCreate,
    user_id: int | None = None,
):
    # --------------------------------------------------------
    # 1. Validate supplier
    # --------------------------------------------------------

    supplier = db.get(
        Supplier,
        data.supplier_id,
    )

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found",
        )

    if not supplier.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Supplier is inactive",
        )

    # --------------------------------------------------------
    # 2. Validate receiving warehouse
    # --------------------------------------------------------

    warehouse = db.get(
        Warehouse,
        data.warehouse_id,
    )

    if not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receiving warehouse not found",
        )

    if not warehouse.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Receiving warehouse is inactive",
        )

    # --------------------------------------------------------
    # 3. Prevent duplicate purchase reference
    # --------------------------------------------------------

    if data.reference:
        existing_reference = db.scalar(
            select(Purchase).where(
                Purchase.reference == data.reference
            )
        )

        if existing_reference:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Purchase reference "
                    f"'{data.reference}' already exists"
                ),
            )

    # --------------------------------------------------------
    # 4. Validate products
    # --------------------------------------------------------

    for item in data.items:
        product = db.get(
            Product,
            item.product_id,
        )

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"Product "
                    f"{item.product_id} not found"
                ),
            )

        if not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Product "
                    f"{item.product_id} is inactive"
                ),
            )

    # --------------------------------------------------------
    # 5. Calculate totals
    # --------------------------------------------------------

    total_amount = Decimal("0.00")

    purchase_items = []

    for item in data.items:
        total_cost = (
            Decimal(item.quantity)
            * item.unit_cost
        )

        total_amount += total_cost

        purchase_items.append(
            PurchaseItem(
                product_id=item.product_id,
                quantity=item.quantity,
                unit_cost=item.unit_cost,
                total_cost=total_cost,
            )
        )

    # --------------------------------------------------------
    # 6. Create purchase
    # --------------------------------------------------------

    purchase = Purchase(
        supplier_id=data.supplier_id,
        warehouse_id=data.warehouse_id,
        reference=data.reference,
        total_amount=total_amount,
        status="PENDING",
        notes=data.notes,
    )

    db.add(purchase)

    db.flush()

    # --------------------------------------------------------
    # 7. Add purchase items
    # --------------------------------------------------------

    for purchase_item in purchase_items:
        purchase_item.purchase_id = (
            purchase.id
        )

        db.add(purchase_item)

    db.commit()

    db.refresh(purchase)

    # --------------------------------------------------------
    # 8. Audit log
    # --------------------------------------------------------

    create_audit_log(
        db=db,
        user_id=user_id,
        action="CREATE",
        entity="Purchase",
        entity_id=purchase.id,
        description=(
            f"Purchase "
            f"{purchase.reference or purchase.id} "
            f"created for warehouse "
            f"{purchase.warehouse_id}"
        ),
    )

    return purchase


# ============================================================
# RECEIVE PURCHASE
# ============================================================

def receive_purchase(
    db: Session,
    purchase_id: int,
    user_id: int | None = None,
):
    # --------------------------------------------------------
    # 1. Get purchase
    # --------------------------------------------------------

    purchase = db.scalar(
        select(Purchase).where(
            Purchase.id == purchase_id
        )
    )

    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase not found",
        )

    # --------------------------------------------------------
    # 2. Prevent receiving twice
    # --------------------------------------------------------

    if purchase.status == "COMPLETED":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Purchase has already been received",
        )

    if purchase.status == "CANCELLED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cancelled purchase cannot be received",
        )

    if purchase.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Purchase cannot be received "
                f"while status is {purchase.status}"
            ),
        )

    # --------------------------------------------------------
    # 3. Validate warehouse
    # --------------------------------------------------------

    warehouse = db.get(
        Warehouse,
        purchase.warehouse_id,
    )

    if not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receiving warehouse not found",
        )

    if not warehouse.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Receiving warehouse is inactive",
        )

    # --------------------------------------------------------
    # 4. Validate purchase has items
    # --------------------------------------------------------

    if not purchase.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Purchase has no items",
        )

    try:
        # ----------------------------------------------------
        # 5. Process every purchase item
        # ----------------------------------------------------

        for item in purchase.items:
            product = db.get(
                Product,
                item.product_id,
            )

            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=(
                        f"Product "
                        f"{item.product_id} not found"
                    ),
                )

            # ------------------------------------------------
            # Find inventory for:
            # product + receiving warehouse
            # ------------------------------------------------

            inventory = db.scalar(
                select(InventoryStock).where(
                    InventoryStock.product_id
                    == item.product_id,

                    InventoryStock.warehouse_id
                    == purchase.warehouse_id,
                )
            )

            # ------------------------------------------------
            # Create inventory record if it does not exist
            # ------------------------------------------------

            if not inventory:
                inventory = InventoryStock(
                    product_id=item.product_id,
                    warehouse_id=purchase.warehouse_id,
                    quantity=0,
                    minimum_stock_level=5,
                    location=None,
                )

                db.add(inventory)

                db.flush()

            # ------------------------------------------------
            # Increase inventory
            # ------------------------------------------------

            inventory.quantity += (
                item.quantity
            )

            # ------------------------------------------------
            # Create STOCK_IN movement
            # ------------------------------------------------

            movement = StockMovement(
                product_id=item.product_id,
                warehouse_id=purchase.warehouse_id,
                movement_type="STOCK_IN",
                quantity=item.quantity,
                unit_cost=item.unit_cost,
                reference=(
                    purchase.reference
                    or f"PURCHASE-{purchase.id}"
                ),
                notes=(
                    f"Received from Purchase "
                    f"#{purchase.id}"
                ),
            )

            db.add(movement)

        # ----------------------------------------------------
        # 6. Mark purchase completed
        # ----------------------------------------------------

        purchase.status = "COMPLETED"

        # ----------------------------------------------------
        # 7. Commit inventory + movements + status together
        # ----------------------------------------------------

        db.commit()

        db.refresh(purchase)

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to receive purchase",
        )

    # --------------------------------------------------------
    # 8. Audit log
    # --------------------------------------------------------

    create_audit_log(
        db=db,
        user_id=user_id,
        action="RECEIVE",
        entity="Purchase",
        entity_id=purchase.id,
        description=(
            f"Purchase "
            f"{purchase.reference or purchase.id} "
            f"received into warehouse "
            f"{purchase.warehouse_id}"
        ),
    )

    return purchase