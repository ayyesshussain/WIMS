from fastapi import FastAPI, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.users import router as users_router

from app.core.config import settings
from app.database.database import get_db

from app.api.routes.auth import router as auth_router
from app.api.routes.categories import router as categories_router
from app.api.routes.warehouses import router as warehouses_router
from app.api.routes.products import router as products_router
from app.api.routes.inventory import router as inventory_router
from app.api.routes.stock_movements import router as stock_movements_router
from app.api.routes.inventory_operations import router as inventory_operations_router
from app.api.routes.suppliers import router as suppliers_router
from app.core.config import settings
from app.api.routes import purchases
from app.api.routes import sales
from app.api.routes import reports
from app.api.routes import notifications
from app.api.routes import audit_logs


app = FastAPI(
    title="WIMS API",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

cors_origins = [
    origin.strip()
    for origin in settings.CORS_ORIGINS.split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "WIMS API is running"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health_check(
    db: Session = Depends(get_db)
):
    try:
        db.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected",
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
        }


# ============================================================
# ROUTERS
# ============================================================

app.include_router(auth_router)
app.include_router(categories_router)
app.include_router(warehouses_router)
app.include_router(products_router)
app.include_router(inventory_router)
app.include_router(stock_movements_router)
app.include_router(inventory_operations_router)
app.include_router(suppliers_router)
app.include_router(users_router)

app.include_router(purchases.router)
app.include_router(sales.router)
app.include_router(reports.router)
app.include_router(notifications.router)
app.include_router(audit_logs.router)
