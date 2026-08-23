import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>WIMS</h2>
        <p>Inventory System</p>
      </div>

      <nav>
        {user?.role === "admin" && (
  <NavLink to="/users">
    User Management
  </NavLink>
)}

        {/* ALL ROLES */}
        <NavLink to="/dashboard">
          Dashboard
        </NavLink>


        {/* ADMIN + WAREHOUSE MANAGER */}
        {[
          "admin",
          "warehouse_manager",
        ].includes(role) && (
          <NavLink to="/categories">
            Categories
          </NavLink>
        )}


        {/* ADMIN + WAREHOUSE MANAGER */}
        {[
          "admin",
          "warehouse_manager",
        ].includes(role) && (
          <NavLink to="/warehouses">
            Warehouses
          </NavLink>
        )}


        {/* ALL ROLES */}
        <NavLink to="/products">
          Products
        </NavLink>


        {/* ALL ROLES */}
        <NavLink to="/inventory">
          Inventory
        </NavLink>


        {/* ADMIN + WAREHOUSE + INVENTORY */}
        {[
          "admin",
          "warehouse_manager",
          "inventory_staff",
        ].includes(role) && (
          <NavLink to="/stock-movements">
            Stock Movements
          </NavLink>
        )}


        {/* ADMIN + WAREHOUSE + INVENTORY */}
        {[
          "admin",
          "warehouse_manager",
          "inventory_staff",
        ].includes(role) && (
          <NavLink to="/inventory-operations">
            Inventory Operations
          </NavLink>
        )}


        {/* ADMIN + WAREHOUSE */}
        {[
          "admin",
          "warehouse_manager",
        ].includes(role) && (
          <NavLink to="/suppliers">
            Suppliers
          </NavLink>
        )}


        {/* ADMIN + WAREHOUSE */}
        {[
          "admin",
          "warehouse_manager",
        ].includes(role) && (
          <NavLink to="/purchases">
            Purchases
          </NavLink>
        )}


        {/* ADMIN + SALES STAFF */}
        {[
          "admin",
          "sales_staff",
        ].includes(role) && (
          <NavLink to="/sales">
            Sales
          </NavLink>
        )}


        {/* ALL ROLES */}
        <NavLink to="/reports">
          Reports
        </NavLink>


        {/* ALL ROLES */}
        <NavLink to="/notifications">
          Notifications
        </NavLink>


        {/* ADMIN ONLY */}
        {role === "admin" && (
          <NavLink to="/audit-logs">
            Audit Logs
          </NavLink>
        )}

      </nav>
    </aside>
  );
}

export default Sidebar;