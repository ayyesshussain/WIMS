from decimal import Decimal
from typing import Any

from pydantic import BaseModel


class DashboardReport(BaseModel):
    total_products: int
    total_stock: int
    total_inventory_value: Decimal
    total_purchases: Decimal
    total_sales: Decimal


class StockReport(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    inventory_value: Decimal


class SalesReport(BaseModel):
    total_sales: Decimal
    number_of_sales: int


class PurchaseReport(BaseModel):
    total_purchases: Decimal
    number_of_purchases: int