from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.audit_log import AuditLogResponse
from app.services.audit_service import get_audit_logs
from app.core.permissions import require_roles

router = APIRouter(
    prefix="/api/audit-logs",
    tags=["Audit Logs"]
)


@router.get(
    "/",
    response_model=list[AuditLogResponse]
)
def list_audit_logs(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("admin")
    ),
):
    return get_audit_logs(db)