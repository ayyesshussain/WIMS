from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.inventory_stock import InventoryStock
from app.models.warehouse import Warehouse


def get_low_stock_alerts(db: Session):
    """
    Return inventory records whose quantity is at or below
    their configured minimum stock level.
    """

    results = db.execute(
        select(
            Product.id.label("product_id"),
            Product.name.label("product_name"),
            InventoryStock.warehouse_id,
            Warehouse.name.label("warehouse_name"),
            InventoryStock.quantity,
            InventoryStock.minimum_stock_level,
        )
        .join(
            InventoryStock,
            InventoryStock.product_id == Product.id,
        )
        .join(
            Warehouse,
            Warehouse.id == InventoryStock.warehouse_id,
        )
        .where(
            InventoryStock.quantity
            <= InventoryStock.minimum_stock_level
        )
        .order_by(
            InventoryStock.quantity.asc()
        )
    ).all()

    alerts = []

    for (
        product_id,
        product_name,
        warehouse_id,
        warehouse_name,
        quantity,
        minimum_stock_level,
    ) in results:

        shortage = max(
            minimum_stock_level - quantity,
            0,
        )

        alerts.append(
            {
                "product_id": product_id,
                "product_name": product_name,

                "warehouse_id": warehouse_id,
                "warehouse_name": warehouse_name,

                "quantity": quantity,

                "minimum_stock_level":
                    minimum_stock_level,

                "shortage": shortage,

                "message": (
                    f"{product_name} is low on stock "
                    f"in {warehouse_name}"
                ),
            }
        )

    return alerts