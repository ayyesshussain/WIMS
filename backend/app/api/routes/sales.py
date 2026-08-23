from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.sale import (
    SaleCreate,
    SaleResponse,
)

from app.services.sale_service import (
    create_sale,
    get_all_sales,
    get_sale_by_id,
)

from app.core.permissions import (
    require_roles,
)


router = APIRouter(
    prefix="/api/sales",
    tags=["Sales"],
)


@router.get(
    "",
    response_model=list[SaleResponse],
)
def list_all_sales(
    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "admin",
            "sales_staff",
        )
    ),
):
    return get_all_sales(db)


@router.post(
    "",
    response_model=SaleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_sale(
    sale_data: SaleCreate,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "admin",
            "sales_staff",
        )
    ),
):
    return create_sale(
        db=db,
        sale_data=sale_data,
        user_id=current_user["user_id"],
    )


@router.get(
    "/{sale_id}",
    response_model=SaleResponse,
)
def get_single_sale(
    sale_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "admin",
            "sales_staff",
        )
    ),
):
    sale = get_sale_by_id(
        db,
        sale_id,
    )

    if not sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sale not found",
        )

    return sale