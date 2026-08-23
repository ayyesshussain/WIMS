from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user, require_roles
from app.database.database import get_db
from app.schemas.category import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
)
from app.services.category_service import (
    create_category,
    delete_category,
    get_categories,
    get_category,
    update_category,
)


router = APIRouter(
    prefix="/api/categories",
    tags=["Categories"]
)


@router.get(
    "",
    response_model=list[CategoryResponse]
)
def list_categories(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_categories(db)


@router.get(
    "/{category_id}",
    response_model=CategoryResponse
)
def get_single_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    category = get_category(db, category_id)

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return category


@router.post(
    "",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("admin")
    )
):
    return create_category(db, data)


@router.put(
    "/{category_id}",
    response_model=CategoryResponse
)
def update_existing_category(
    category_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("admin")
    )
):
    category = get_category(db, category_id)

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return update_category(
        db,
        category,
        data
    )


@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_existing_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("admin")
    )
):
    category = get_category(db, category_id)

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    delete_category(db, category)

    return None