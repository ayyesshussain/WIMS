from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
from fastapi import HTTPException, status


def create_product(db: Session, data):
    existing_sku = db.execute(
        select(Product).where(
            Product.sku == data.sku
        )
    ).scalar_one_or_none()

    if existing_sku:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Product with SKU '{data.sku}' already exists"
        )

    existing_barcode = db.execute(
        select(Product).where(
            Product.barcode == data.barcode
        )
    ).scalar_one_or_none()

    if existing_barcode:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Product with barcode '{data.barcode}' already exists"
        )

    product = Product(
        name=data.name,
        sku=data.sku,
        barcode=data.barcode,
        category_id=data.category_id,
        purchase_price=data.purchase_price,
        selling_price=data.selling_price,
        unit=data.unit,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


def get_products(
    db: Session,
    search: str | None = None
) -> list[Product]:

    query = select(Product)

    if search:
        search_term = f"%{search}%"

        query = query.where(
            or_(
                Product.name.ilike(search_term),
                Product.sku.ilike(search_term),
                Product.barcode.ilike(search_term),
            )
        )

    query = query.order_by(
        Product.id.desc()
    )

    result = db.execute(query)

    return list(result.scalars().all())


def get_product(
    db: Session,
    product_id: int
) -> Product | None:

    return db.get(Product, product_id)


def get_product_by_barcode(
    db: Session,
    barcode: str
) -> Product | None:

    return db.scalar(
        select(Product).where(
            Product.barcode == barcode
        )
    )


def update_product(
    db: Session,
    product: Product,
    data: ProductUpdate
) -> Product:

    update_data = data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    return product


def delete_product(
    db: Session,
    product: Product
) -> None:

    db.delete(product)
    db.commit()