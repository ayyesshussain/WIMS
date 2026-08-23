from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.notification_service import get_low_stock_alerts
from app.schemas.notification import LowStockAlert
from app.core.permissions import get_current_user


router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"]
)


@router.get(
    "/low-stock",
    response_model=list[LowStockAlert]
)
def low_stock_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_low_stock_alerts(db)