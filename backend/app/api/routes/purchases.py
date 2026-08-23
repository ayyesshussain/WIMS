from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.core.permissions import (
    require_roles,
)

from app.database.database import (
    get_db,
)

from app.schemas.purchase import (
    PurchaseCreate,
    PurchaseResponse,
)

from app.services.purchase_service import (
    create_purchase,
    get_purchase,
    list_purchases,
    receive_purchase,
)


router = APIRouter(
    prefix="/api/purchases",
    tags=["Purchases"],
)


# ============================================================
# LIST PURCHASES
# ============================================================

@router.get(
    "",
    response_model=list[PurchaseResponse],
)
def list_all_purchases(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "admin",
            "warehouse_manager",
        )
    ),
):
    return list_purchases(db)


# ============================================================
# CREATE PURCHASE
# ============================================================

@router.post(
    "",
    response_model=PurchaseResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_purchase(
    data: PurchaseCreate,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "admin",
            "warehouse_manager",
        )
    ),
):
    return create_purchase(
        db=db,
        data=data,
        user_id=current_user["user_id"],
    )


# ============================================================
# RECEIVE PURCHASE
# ============================================================

@router.post(
    "/{purchase_id}/receive",
    response_model=PurchaseResponse,
)
def receive_existing_purchase(
    purchase_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "admin",
            "warehouse_manager",
        )
    ),
):
    return receive_purchase(
        db=db,
        purchase_id=purchase_id,
        user_id=current_user["user_id"],
    )


# ============================================================
# GET SINGLE PURCHASE
# IMPORTANT:
# Keep this AFTER /{purchase_id}/receive
# ============================================================

@router.get(
    "/{purchase_id}",
    response_model=PurchaseResponse,
)
def get_single_purchase(
    purchase_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "admin",
            "warehouse_manager",
        )
    ),
):
    purchase = get_purchase(
        db,
        purchase_id,
    )

    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase not found",
        )

    return purchase