"""add warehouse to purchases

Revision ID: 96fba63838a1
Revises: 8f9066b6f9b4
Create Date: 2026-08-22 22:20:09.660313

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "96fba63838a1"
down_revision: Union[str, Sequence[str], None] = "8f9066b6f9b4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # 1. Add warehouse_id temporarily as nullable
    op.add_column(
        "purchases",
        sa.Column(
            "warehouse_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    # 2. Create index
    op.create_index(
        "ix_purchases_warehouse_id",
        "purchases",
        ["warehouse_id"],
        unique=False,
    )

    # 3. Create foreign key
    op.create_foreign_key(
        "fk_purchases_warehouse_id",
        "purchases",
        "warehouses",
        ["warehouse_id"],
        ["id"],
    )

    # 4. Give all OLD purchases an existing warehouse
    #
    # IMPORTANT:
    # Change warehouse_id = 1 below if warehouse 1
    # does not exist in your database.
    op.execute(
        """
        UPDATE purchases
        SET warehouse_id = 1
        WHERE warehouse_id IS NULL
        """
    )

    # 5. Now make warehouse_id required
    op.alter_column(
        "purchases",
        "warehouse_id",
        existing_type=sa.Integer(),
        nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_constraint(
        "fk_purchases_warehouse_id",
        "purchases",
        type_="foreignkey",
    )

    op.drop_index(
        "ix_purchases_warehouse_id",
        table_name="purchases",
    )

    op.drop_column(
        "purchases",
        "warehouse_id",
    )