from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.inventory_stock import InventoryStock
from app.models.purchase import Purchase
from app.models.sale import Sale
from app.models.category import Category
from app.models.warehouse import Warehouse
from app.models.supplier import Supplier
def get_dashboard_report(db: Session):

    # Total products
    total_products = db.scalar(
        select(func.count(Product.id))
    ) or 0

    # Total categories
    total_categories = db.scalar(
        select(func.count(Category.id))
    ) or 0

    # Total warehouses
    total_warehouses = db.scalar(
        select(func.count(Warehouse.id))
    ) or 0

    # Total suppliers
    total_suppliers = db.scalar(
        select(func.count(Supplier.id))
    ) or 0

    # Total stock
    total_stock = db.scalar(
        select(
            func.coalesce(
                func.sum(InventoryStock.quantity),
                0
            )
        )
    ) or 0

    # Low stock items
    low_stock_items = db.scalar(
        select(
            func.count(InventoryStock.id)
        ).where(
            InventoryStock.quantity <=
            InventoryStock.minimum_stock_level
        )
    ) or 0

    # Total inventory value
    total_inventory_value = db.scalar(
        select(
            func.coalesce(
                func.sum(
                    InventoryStock.quantity *
                    Product.purchase_price
                ),
                0
            )
        )
        .join(
            Product,
            Product.id == InventoryStock.product_id
        )
    ) or Decimal("0.00")

    # Total purchases amount
    total_purchases = db.scalar(
        select(
            func.coalesce(
                func.sum(Purchase.total_amount),
                0
            )
        )
    ) or Decimal("0.00")

    # Number of purchases
    number_of_purchases = db.scalar(
        select(func.count(Purchase.id))
    ) or 0

    # Total sales amount
    total_sales = db.scalar(
        select(
            func.coalesce(
                func.sum(Sale.total_amount),
                0
            )
        )
    ) or Decimal("0.00")

    # Number of sales
    number_of_sales = db.scalar(
        select(func.count(Sale.id))
    ) or 0

    return {
        "total_products": total_products,
        "total_categories": total_categories,
        "total_warehouses": total_warehouses,
        "total_suppliers": total_suppliers,
        "total_stock": total_stock,
        "low_stock_items": low_stock_items,
        "total_inventory_value": total_inventory_value,
        "total_purchases": total_purchases,
        "number_of_purchases": number_of_purchases,
        "total_sales": total_sales,
        "number_of_sales": number_of_sales,
    }




def get_stock_report(db: Session):

    results = db.execute(
        select(
            Product.id,
            Product.name,
            InventoryStock.quantity,
            Product.purchase_price,
        )
        .join(
            Product,
            Product.id == InventoryStock.product_id
        )
        .order_by(Product.id)
    ).all()

    report = []

    for row in results:

        inventory_value = (
            Decimal(row.quantity) *
            row.purchase_price
        )

        report.append({
            "product_id": row.id,
            "product_name": row.name,
            "quantity": row.quantity,
            "inventory_value": inventory_value,
        })

    return report


def get_sales_report(db: Session):

    total_sales = db.scalar(
        select(
            func.coalesce(
                func.sum(Sale.total_amount),
                0
            )
        )
    ) or Decimal("0.00")

    number_of_sales = db.scalar(
        select(func.count(Sale.id))
    ) or 0

    return {
        "total_sales": total_sales,
        "number_of_sales": number_of_sales,
    }


def get_purchase_report(db: Session):

    total_purchases = db.scalar(
        select(
            func.coalesce(
                func.sum(Purchase.total_amount),
                0
            )
        )
    ) or Decimal("0.00")

    number_of_purchases = db.scalar(
        select(func.count(Purchase.id))
    ) or 0

    return {
        "total_purchases": total_purchases,
        "number_of_purchases": number_of_purchases,
    }