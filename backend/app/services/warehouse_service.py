from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.warehouse import Warehouse
from app.schemas.warehouse import (
    WarehouseCreate,
    WarehouseUpdate,
)


def create_warehouse(
    db: Session,
    data: WarehouseCreate
) -> Warehouse:

    warehouse = Warehouse(
        name=data.name,
        code=data.code,
        address=data.address,
    )

    db.add(warehouse)
    db.commit()
    db.refresh(warehouse)

    return warehouse


def get_warehouses(
    db: Session
) -> list[Warehouse]:

    result = db.execute(
        select(Warehouse)
        .order_by(Warehouse.id.desc())
    )

    return list(result.scalars().all())


def get_warehouse(
    db: Session,
    warehouse_id: int
) -> Warehouse | None:

    return db.get(Warehouse, warehouse_id)


def update_warehouse(
    db: Session,
    warehouse: Warehouse,
    data: WarehouseUpdate
) -> Warehouse:

    update_data = data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(warehouse, field, value)

    db.commit()
    db.refresh(warehouse)

    return warehouse


def delete_warehouse(
    db: Session,
    warehouse: Warehouse
) -> None:

    db.delete(warehouse)
    db.commit()