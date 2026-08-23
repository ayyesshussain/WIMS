from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def create_audit_log(
    db: Session,
    action: str,
    entity: str,
    entity_id: int | None = None,
    description: str | None = None,
    user_id: int | None = None,
):
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        entity=entity,
        entity_id=entity_id,
        description=description,
    )

    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)

    return audit_log


def get_audit_logs(db: Session):
    return db.scalars(
        select(AuditLog)
        .order_by(AuditLog.id.desc())
    ).all()