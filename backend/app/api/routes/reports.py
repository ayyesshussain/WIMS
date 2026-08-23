from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.permissions import get_current_user
from app.database.database import get_db
from app.services.report_service import (
    get_dashboard_report,
    get_stock_report,
    get_sales_report,
    get_purchase_report,
)

router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"],
)


@router.get("/dashboard")
def dashboard_report(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_dashboard_report(db)


@router.get("/stock")
def stock_report(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_stock_report(db)


@router.get("/sales")
def sales_report(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_sales_report(db)


@router.get("/purchases")
def purchase_report(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_purchase_report(db)