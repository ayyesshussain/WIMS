import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/api/reports/dashboard");
        setData(response.data);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
          "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <p>
        Welcome, {user?.full_name}
      </p>

      <div className="dashboard-grid">

        <div className="dashboard-card">
          <h3>Total Products</h3>
          <p>{data?.total_products}</p>
        </div>

        <div className="dashboard-card">
          <h3>Total Stock</h3>
          <p>{data?.total_stock}</p>
        </div>

        <div className="dashboard-card">
          <h3>Inventory Value</h3>
          <p>Rs. {data?.total_inventory_value}</p>
        </div>

        <div className="dashboard-card">
          <h3>Total Sales</h3>
          <p>Rs. {data?.total_sales}</p>
        </div>

        <div className="dashboard-card">
          <h3>Total Purchases</h3>
          <p>Rs. {data?.total_purchases}</p>
        </div>

        <div className="dashboard-card">
          <h3>Low Stock Items</h3>
          <p>{data?.low_stock_items}</p>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;