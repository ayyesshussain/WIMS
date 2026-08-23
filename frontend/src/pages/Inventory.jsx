import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Inventory() {
  const { user } = useAuth();

  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    product_id: "",
    warehouse_id: "",
    quantity: "",
    minimum_stock_level: "",
    location: "",
  });

  const isAdmin = user?.role === "admin";

  const canManageInventory =
    user?.role === "admin" ||
    user?.role === "warehouse_manager" ||
    user?.role === "inventory_staff";

  const fetchInventory = async () => {
    try {
      setLoading(true);

      const response = await api.get("/api/inventory");

      setInventory(response.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load inventory"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get("/api/products");
      setProducts(response.data);
    } catch {
      setError("Failed to load products");
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await api.get("/api/warehouses");
      setWarehouses(response.data);
    } catch {
      setError("Failed to load warehouses");
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchProducts();
    fetchWarehouses();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      product_id: "",
      warehouse_id: "",
      quantity: "",
      minimum_stock_level: "",
      location: "",
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        const updatePayload = {
          minimum_stock_level:
            Number(form.minimum_stock_level),
          location: form.location,
        };

        await api.put(
          `/api/inventory/${editingId}`,
          updatePayload
        );
      } else {
        const createPayload = {
          product_id: Number(form.product_id),
          warehouse_id: Number(form.warehouse_id),
          quantity: Number(form.quantity),
          minimum_stock_level:
            Number(form.minimum_stock_level),
          location: form.location,
        };

        await api.post(
          "/api/inventory",
          createPayload
        );
      }

      resetForm();
      fetchInventory();
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Inventory operation failed"
      );
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);

    setForm({
      product_id: item.product_id,
      warehouse_id: item.warehouse_id,
      quantity: item.quantity,
      minimum_stock_level:
        item.minimum_stock_level,
      location: item.location || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this inventory record?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/api/inventory/${id}`);
      fetchInventory();
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to delete inventory record"
      );
    }
  };

  const getProductName = (productId) => {
    const product = products.find(
      (item) => item.id === productId
    );

    return product?.name || `Product ${productId}`;
  };

  const getWarehouseName = (warehouseId) => {
    const warehouse = warehouses.find(
      (item) => item.id === warehouseId
    );

    return (
      warehouse?.name ||
      `Warehouse ${warehouseId}`
    );
  };

  return (
    <div>
      <div className="page-header">
        <h1>Inventory</h1>

        <p>
          View and manage product stock across warehouses
        </p>
      </div>

      {error && (
        <div className="page-error">
          {typeof error === "string"
            ? error
            : "Inventory operation failed"}
        </div>
      )}

      {canManageInventory && (
        <div className="form-card">
          <h2>
            {editingId
              ? "Update Inventory"
              : "Create Inventory Record"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="module-form"
          >
            <div>
              <label>Product</label>

              <select
                name="product_id"
                value={form.product_id}
                onChange={handleChange}
                disabled={Boolean(editingId)}
                required
              >
                <option value="">
                  Select product
                </option>

                {products.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name} — {product.sku}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Warehouse</label>

              <select
                name="warehouse_id"
                value={form.warehouse_id}
                onChange={handleChange}
                disabled={Boolean(editingId)}
                required
              >
                <option value="">
                  Select warehouse
                </option>

                {warehouses.map((warehouse) => (
                  <option
                    key={warehouse.id}
                    value={warehouse.id}
                  >
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </div>

            {!editingId && (
              <div>
                <label>Starting Quantity</label>

                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>
            )}

            <div>
              <label>Minimum Stock Level</label>

              <input
                type="number"
                name="minimum_stock_level"
                value={form.minimum_stock_level}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div>
              <label>Location</label>

              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Rack A-01"
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="primary-button"
              >
                {editingId
                  ? "Update Inventory"
                  : "Create Inventory"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <h2>Inventory Records</h2>

        {loading ? (
          <p>Loading inventory...</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Warehouse</th>
                  <th>Quantity</th>
                  <th>Minimum Level</th>
                  <th>Location</th>
                  <th>Stock Status</th>

                  {canManageInventory && (
                    <th>Actions</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {inventory.length === 0 ? (
                  <tr>
                    <td
                      colSpan={
                        canManageInventory ? 8 : 7
                      }
                      className="empty-table"
                    >
                      No inventory records found.
                    </td>
                  </tr>
                ) : (
                  inventory.map((item) => {
                    const isLowStock =
                      item.quantity <=
                      item.minimum_stock_level;

                    return (
                      <tr key={item.id}>
                        <td>{item.id}</td>

                        <td>
                          {getProductName(
                            item.product_id
                          )}
                        </td>

                        <td>
                          {getWarehouseName(
                            item.warehouse_id
                          )}
                        </td>

                        <td>{item.quantity}</td>

                        <td>
                          {item.minimum_stock_level}
                        </td>

                        <td>
                          {item.location || "-"}
                        </td>

                        <td>
                          <span
                            className={
                              isLowStock
                                ? "stock-low"
                                : "stock-good"
                            }
                          >
                            {isLowStock
                              ? "Low Stock"
                              : "Available"}
                          </span>
                        </td>

                        {canManageInventory && (
                          <td className="action-buttons">
                            <button
                              className="edit-button"
                              onClick={() =>
                                handleEdit(item)
                              }
                            >
                              Edit
                            </button>

                            {isAdmin && (
                              <button
                                className="delete-button"
                                onClick={() =>
                                  handleDelete(item.id)
                                }
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Inventory;