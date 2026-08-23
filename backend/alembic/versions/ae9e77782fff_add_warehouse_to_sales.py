"""add warehouse to sales

Revision ID: ae9e77782fff
Revises: 96fba63838a1
Create Date: 2026-08-22 23:09:32.907006

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ae9e77782fff'
down_revision: Union[str, Sequence[str], None] = '96fba63838a1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add warehouse_id as nullable first
    # This prevents existing sales from causing migration failure.
    op.add_column(
        "sales",
        sa.Column(
            "warehouse_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    # 2. Create index
    op.create_index(
        "ix_sales_warehouse_id",
        "sales",
        ["warehouse_id"],
        unique=False,
    )

    # 3. Create foreign key
    op.create_foreign_key(
        "fk_sales_warehouse_id",
        "sales",
        "warehouses",
        ["warehouse_id"],
        ["id"],
    )

    # 4. Assign existing old sales to Main Warehouse (ID 1)
    op.execute(
        """
        UPDATE sales
        SET warehouse_id = 1
        WHERE warehouse_id IS NULL
        """
    )

    # 5. Now warehouse_id can safely become required
    op.alter_column(
        "sales",
        "warehouse_id",
        existing_type=sa.Integer(),
        nullable=False,
    )

def downgrade() -> None:
    op.drop_constraint(
        "fk_sales_warehouse_id",
        "sales",
        type_="foreignkey",
    )

    op.drop_index(
        "ix_sales_warehouse_id",
        table_name="sales",
    )

    op.drop_column(
        "sales",
        "warehouse_id",
    )