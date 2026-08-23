from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


def create_category(
    db: Session,
    data: CategoryCreate
) -> Category:

    category = Category(
        name=data.name,
        description=data.description
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    return category


def get_categories(
    db: Session
) -> list[Category]:

    result = db.execute(
        select(Category)
        .order_by(Category.id.desc())
    )

    return list(result.scalars().all())


def get_category(
    db: Session,
    category_id: int
) -> Category | None:

    return db.get(Category, category_id)


def update_category(
    db: Session,
    category: Category,
    data: CategoryUpdate
) -> Category:

    update_data = data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)

    return category


def delete_category(
    db: Session,
    category: Category
) -> None:

    db.delete(category)
    db.commit()