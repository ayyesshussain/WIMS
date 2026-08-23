from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password


users = [
    {
        "full_name": "Warehouse Manager",
        "email": "warehouse@wims.com",
        "password": "Warehouse@123",
        "role": "warehouse_manager",
    },
    {
        "full_name": "Inventory Staff",
        "email": "inventory@wims.com",
        "password": "Inventory@123",
        "role": "inventory_staff",
    },
    {
        "full_name": "Sales Staff",
        "email": "sales@wims.com",
        "password": "Sales@123",
        "role": "sales_staff",
    },
]


db: Session = SessionLocal()

try:
    for user_data in users:

        existing_user = (
            db.query(User)
            .filter(User.email == user_data["email"])
            .first()
        )

        if existing_user:
            print(f"Already exists: {user_data['email']}")
            continue

        user = User(
            full_name=user_data["full_name"],
            email=user_data["email"],
            password_hash=hash_password(
                user_data["password"]
            ),
            role=user_data["role"],
            is_active=True,
        )

        db.add(user)

    db.commit()

    print("Test users created successfully.")

finally:
    db.close()