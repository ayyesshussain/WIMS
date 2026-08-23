import { useEffect, useState } from "react";
import api from "../api/axios";

function Notifications() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAlerts = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/api/notifications/low-stock"
      );

      setAlerts(response.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Notifications</h1>
        <p>
          View low-stock alerts and inventory warnings
        </p>
      </div>

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      <div className="report-section-header">
        <h2>Low Stock Alerts</h2>

        <button
          className="secondary-button"
          onClick={fetchAlerts}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading notifications...</p>
      ) : alerts.length === 0 ? (
        <div className="notification-empty">
          <h3>No low-stock alerts</h3>
          <p>
            All inventory items are currently above their
            minimum stock levels.
          </p>
        </div>
      ) : (
        <div className="notification-grid">
          {alerts.map((alert, index) => (
            <div
              className="notification-card"
              key={`${alert.product_id}-${alert.warehouse_id}-${index}`}
            >
              <div className="notification-card-header">
                <h3>
                  {alert.product_name ||
                    `Product ${alert.product_id}`}
                </h3>

                <span className="low-stock-badge">
                  Low Stock
                </span>
              </div>

              <div className="notification-details">
                <p>
                  <strong>Product ID:</strong>{" "}
                  {alert.product_id}
                </p>

                  <p>
                    <strong>Warehouse:</strong>{" "}
                    {alert.warehouse_name}
                  </p>
                

                <p>
                  <strong>Current Quantity:</strong>{" "}
                  {alert.quantity}
                </p>

                <p>
                  <strong>Minimum Level:</strong>{" "}
                  {alert.minimum_stock_level}
                </p>

                <p>
  <strong>Shortage:</strong>{" "}
  {alert.shortage}
</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;