from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)
from sqlalchemy.orm import Session

from app.core.permissions import (
    get_current_user,
    require_roles,
)
from app.database.database import get_db
from app.schemas.product import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)
from app.services.product_service import (
    create_product,
    delete_product,
    get_product,
    get_product_by_barcode,
    get_products,
    update_product,
)


router = APIRouter(
    prefix="/api/products",
    tags=["Products"]
)


@router.get(
    "",
    response_model=list[ProductResponse]
)
def list_products(
    search: str | None = Query(
        default=None
    ),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_products(
        db,
        search
    )


@router.get(
    "/barcode/{barcode}",
    response_model=ProductResponse
)
def find_product_by_barcode(
    barcode: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    product = get_product_by_barcode(
        db,
        barcode
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product



@router.get(
    "/{product_id}",
    response_model=ProductResponse
)
def get_single_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    product = get_product(
        db,
        product_id
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "admin"
            
        )
    )
):
    return create_product(
        db,
        data
    )


@router.put(
    "/{product_id}",
    response_model=ProductResponse
)
def update_existing_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("admin")
    )
):
    product = get_product(
        db,
        product_id
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return update_product(
        db,
        product,
        data
    )


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_existing_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("admin")
    )
):
    product = get_product(
        db,
        product_id
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    delete_product(
        db,
        product
    )

    return None