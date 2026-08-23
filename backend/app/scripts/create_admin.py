from sqlalchemy import select

from app.database.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password


ADMIN_EMAIL = "admin@wims.com"
ADMIN_PASSWORD = "Admin@12345"


def create_admin():
    db = SessionLocal()

    try:
        existing_user = db.execute(
            select(User).where(
                User.email == ADMIN_EMAIL
            )
        ).scalar_one_or_none()

        if existing_user:
            print("Admin already exists.")
            return

        admin = User(
            full_name="System Administrator",
            email=ADMIN_EMAIL,
            password_hash=hash_password(
                ADMIN_PASSWORD
            ),
            role="admin",
            is_active=True
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print("Admin created successfully.")
        print(f"Email: {ADMIN_EMAIL}")
        print(f"Password: {ADMIN_PASSWORD}")

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()