import { useEffect, useState } from "react";
import api from "../api/axios";

function Reports() {
  const [dashboard, setDashboard] = useState(null);
  const [stock, setStock] = useState([]);
  const [sales, setSales] = useState(null);
  const [purchases, setPurchases] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);

      const [
        dashboardResponse,
        stockResponse,
        salesResponse,
        purchasesResponse,
      ] = await Promise.all([
        api.get("/api/reports/dashboard"),
        api.get("/api/reports/stock"),
        api.get("/api/reports/sales"),
        api.get("/api/reports/purchases"),
      ]);

      setDashboard(dashboardResponse.data);
      setStock(stockResponse.data);
      setSales(salesResponse.data);
      setPurchases(purchasesResponse.data);

      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load reports"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return <p>Loading reports...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Reports</h1>
        <p>
          View warehouse, inventory, sales and purchase
          statistics
        </p>
      </div>

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      {dashboard && (
        <>
          <div className="report-section-header">
            <h2>Dashboard Summary</h2>

            <button
              className="secondary-button"
              onClick={fetchReports}
            >
              Refresh
            </button>
          </div>

          <div className="dashboard-grid">
            <ReportCard
              title="Products"
              value={dashboard.total_products}
            />

            <ReportCard
              title="Categories"
              value={dashboard.total_categories}
            />

            <ReportCard
              title="Warehouses"
              value={dashboard.total_warehouses}
            />

            <ReportCard
              title="Suppliers"
              value={dashboard.total_suppliers}
            />

            <ReportCard
              title="Total Stock"
              value={dashboard.total_stock}
            />

            <ReportCard
              title="Low Stock Items"
              value={dashboard.low_stock_items}
            />

            <ReportCard
              title="Inventory Value"
              value={`Rs. ${Number(
                dashboard.total_inventory_value || 0
              ).toLocaleString()}`}
            />

            <ReportCard
              title="Total Sales"
              value={`Rs. ${Number(
                dashboard.total_sales || 0
              ).toLocaleString()}`}
            />

            <ReportCard
              title="Number of Sales"
              value={dashboard.number_of_sales}
            />

            <ReportCard
              title="Total Purchases"
              value={`Rs. ${Number(
                dashboard.total_purchases || 0
              ).toLocaleString()}`}
            />

            <ReportCard
              title="Number of Purchases"
              value={dashboard.number_of_purchases}
            />
          </div>
        </>
      )}

      <div className="table-card">
        <h2>Stock Report</h2>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Inventory Value</th>
              </tr>
            </thead>

            <tbody>
              {stock.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="empty-table"
                  >
                    No stock records found.
                  </td>
                </tr>
              ) : (
                stock.map((item, index) => (
                  <tr key={`${item.product_id}-${index}`}>
                    <td>{item.product_id}</td>
                    <td>{item.product_name}</td>
                    <td>{item.quantity}</td>
                    <td>
                      Rs.{" "}
                      {Number(
                        item.inventory_value || 0
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="report-summary-grid">
        <div className="form-card">
          <h2>Sales Report</h2>

          <div className="report-big-number">
            Rs.{" "}
            {Number(
              sales?.total_sales || 0
            ).toLocaleString()}
          </div>

          <p>
            Total Sales:{" "}
            <strong>
              {sales?.number_of_sales || 0}
            </strong>
          </p>
        </div>

        <div className="form-card">
          <h2>Purchase Report</h2>

          <div className="report-big-number">
            Rs.{" "}
            {Number(
              purchases?.total_purchases || 0
            ).toLocaleString()}
          </div>

          <p>
            Total Purchases:{" "}
            <strong>
              {purchases?.number_of_purchases || 0}
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ title, value }) {
  return (
    <div className="dashboard-card">
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
}

export default Reports;