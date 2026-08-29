import {
  HashRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Warehouses from "./pages/Warehouses";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import InventoryOperations from "./pages/InventoryOperations";
import StockMovements from "./pages/StockMovements";
import Suppliers from "./pages/Suppliers";
import Purchases from "./pages/Purchases";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import AuditLogs from "./pages/AuditLogs";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";


function App() {
  return (
    <HashRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* DEFAULT */}
        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />


        {/* PROTECTED APPLICATION */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >

          {/* DASHBOARD */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />


          {/* USER MANAGEMENT - ADMIN ONLY */}
          <Route
            path="/users"
            element={
              <ProtectedRoute
                allowedRoles={["admin"]}
              >
                <Users />
              </ProtectedRoute>
            }
          />


          {/* CATEGORIES */}
          <Route
            path="/categories"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "admin",
                  "warehouse_manager",
                ]}
              >
                <Categories />
              </ProtectedRoute>
            }
          />


          {/* WAREHOUSES */}
          <Route
            path="/warehouses"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "admin",
                  "warehouse_manager",
                ]}
              >
                <Warehouses />
              </ProtectedRoute>
            }
          />


          {/* PRODUCTS */}
          <Route
            path="/products"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "admin",
                  "warehouse_manager",
                  "inventory_staff",
                  "sales_staff",
                ]}
              >
                <Products />
              </ProtectedRoute>
            }
          />


          {/* INVENTORY */}
          <Route
            path="/inventory"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "admin",
                  "warehouse_manager",
                  "inventory_staff",
                  "sales_staff",
                ]}
              >
                <Inventory />
              </ProtectedRoute>
            }
          />


          {/* STOCK MOVEMENTS */}
          <Route
            path="/stock-movements"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "admin",
                  "warehouse_manager",
                  "inventory_staff",
                ]}
              >
                <StockMovements />
              </ProtectedRoute>
            }
          />


          {/* INVENTORY OPERATIONS */}
          <Route
            path="/inventory-operations"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "admin",
                  "warehouse_manager",
                  "inventory_staff",
                ]}
              >
                <InventoryOperations />
              </ProtectedRoute>
            }
          />


          {/* SUPPLIERS */}
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "admin",
                  "warehouse_manager",
                ]}
              >
                <Suppliers />
              </ProtectedRoute>
            }
          />


          {/* PURCHASES */}
          <Route
            path="/purchases"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "admin",
                  "warehouse_manager",
                ]}
              >
                <Purchases />
              </ProtectedRoute>
            }
          />


          {/* SALES */}
          <Route
            path="/sales"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "admin",
                  "sales_staff",
                ]}
              >
                <Sales />
              </ProtectedRoute>
            }
          />


          {/* REPORTS */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "admin",
                  "warehouse_manager",
                  "inventory_staff",
                  "sales_staff",
                ]}
              >
                <Reports />
              </ProtectedRoute>
            }
          />


          {/* NOTIFICATIONS */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "admin",
                  "warehouse_manager",
                  "inventory_staff",
                  "sales_staff",
                ]}
              >
                <Notifications />
              </ProtectedRoute>
            }
          />


          {/* AUDIT LOGS */}
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute
                allowedRoles={["admin"]}
              >
                <AuditLogs />
              </ProtectedRoute>
            }
          />

        </Route>


        {/* 404 */}
        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </HashRouter>
  );
}


export default App;