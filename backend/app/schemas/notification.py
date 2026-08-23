from pydantic import BaseModel


class LowStockAlert(BaseModel):
    product_id: int
    product_name: str

    warehouse_id: int
    warehouse_name: str

    quantity: int
    minimum_stock_level: int
    shortage: int

    message: str