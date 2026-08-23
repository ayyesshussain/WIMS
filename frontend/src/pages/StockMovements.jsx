import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function StockMovements() {
  const { user } = useAuth();

  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    product_id: "",
    warehouse_id: "",
    movement_type: "STOCK_IN",
    quantity: "",
    unit_cost: "",
    reference: "",
    notes: "",
  });

  const isAdmin = user?.role === "admin";

  const canCreate =
    user?.role === "admin" ||
    user?.role === "inventory_staff";

  const fetchMovements = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/api/stock-movements"
      );

      setMovements(response.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load stock movements"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportData = async () => {
    try {
      const [productResponse, warehouseResponse] =
        await Promise.all([
          api.get("/api/products"),
          api.get("/api/warehouses"),
        ]);

      setProducts(productResponse.data);
      setWarehouses(warehouseResponse.data);
    } catch {
      setError(
        "Failed to load products or warehouses"
      );
    }
  };

  useEffect(() => {
    fetchMovements();
    fetchSupportData();
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
      movement_type: "STOCK_IN",
      quantity: "",
      unit_cost: "",
      reference: "",
      notes: "",
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(
          `/api/stock-movements/${editingId}`,
          {
            quantity: Number(form.quantity),
            unit_cost: form.unit_cost
              ? Number(form.unit_cost)
              : null,
            reference: form.reference || null,
            notes: form.notes || null,
          }
        );
      } else {
        await api.post(
          "/api/stock-movements",
          {
            product_id: Number(form.product_id),
            warehouse_id: Number(
              form.warehouse_id
            ),
            movement_type: form.movement_type,
            quantity: Number(form.quantity),
            unit_cost: form.unit_cost
              ? Number(form.unit_cost)
              : null,
            reference: form.reference || null,
            notes: form.notes || null,
          }
        );
      }

      resetForm();
      fetchMovements();
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Stock movement operation failed"
      );
    }
  };

  const handleEdit = (movement) => {
    setEditingId(movement.id);

    setForm({
      product_id: movement.product_id,
      warehouse_id: movement.warehouse_id,
      movement_type: movement.movement_type,
      quantity: movement.quantity,
      unit_cost: movement.unit_cost || "",
      reference: movement.reference || "",
      notes: movement.notes || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this stock movement?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/api/stock-movements/${id}`
      );

      fetchMovements();
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to delete stock movement"
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

  const filteredMovements = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return movements;

    return movements.filter((movement) => {
      const productName =
        getProductName(
          movement.product_id
        ).toLowerCase();

      const warehouseName =
        getWarehouseName(
          movement.warehouse_id
        ).toLowerCase();

      return (
        movement.movement_type
          ?.toLowerCase()
          .includes(term) ||
        movement.reference
          ?.toLowerCase()
          .includes(term) ||
        movement.notes
          ?.toLowerCase()
          .includes(term) ||
        productName.includes(term) ||
        warehouseName.includes(term)
      );
    });
  }, [search, movements, products, warehouses]);

  return (
    <div>
      <div className="page-header">
        <h1>Stock Movements</h1>

        <p>
          View and manage stock movement history
        </p>
      </div>

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      <div className="form-card">
        <h2>Search Movements</h2>

        <div className="search-form">
          <input
            type="text"
            placeholder="Search by type, reference, product or warehouse"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <button
            type="button"
            className="secondary-button"
            onClick={() => setSearch("")}
          >
            Clear
          </button>
        </div>
      </div>

      {canCreate && (
        <div className="form-card">
          <h2>
            {editingId
              ? "Update Stock Movement"
              : "Create Stock Movement"}
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
                    {product.name}
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

            <div>
              <label>Movement Type</label>

              <select
                name="movement_type"
                value={form.movement_type}
                onChange={handleChange}
                disabled={Boolean(editingId)}
                required
              >
                <option value="STOCK_IN">
                  STOCK_IN
                </option>

                <option value="STOCK_OUT">
                  STOCK_OUT
                </option>

                <option value="DAMAGED">
                  DAMAGED
                </option>

                <option value="ADJUSTMENT">
                  ADJUSTMENT
                </option>

                <option value="TRANSFER_IN">
                  TRANSFER_IN
                </option>

                <option value="TRANSFER_OUT">
                  TRANSFER_OUT
                </option>
              </select>
            </div>

            <div>
              <label>Quantity</label>

              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div>
              <label>Unit Cost</label>

              <input
                type="number"
                name="unit_cost"
                value={form.unit_cost}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label>Reference</label>

              <input
                type="text"
                name="reference"
                value={form.reference}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Notes</label>

              <input
                type="text"
                name="notes"
                value={form.notes}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="primary-button"
              >
                {editingId
                  ? "Update Movement"
                  : "Create Movement"}
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
        <h2>Movement History</h2>

        {loading ? (
          <p>Loading stock movements...</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Warehouse</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Unit Cost</th>
                  <th>Reference</th>
                  <th>Notes</th>
                  <th>Date</th>

                  {canCreate && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td
                      colSpan={
                        canCreate ? 10 : 9
                      }
                      className="empty-table"
                    >
                      No stock movements found.
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map(
                    (movement) => (
                      <tr key={movement.id}>
                        <td>{movement.id}</td>

                        <td>
                          {getProductName(
                            movement.product_id
                          )}
                        </td>

                        <td>
                          {getWarehouseName(
                            movement.warehouse_id
                          )}
                        </td>

                        <td>
                          <span className="movement-badge">
                            {movement.movement_type}
                          </span>
                        </td>

                        <td>
                          {movement.quantity}
                        </td>

                        <td>
                          {movement.unit_cost
                            ? `Rs. ${movement.unit_cost}`
                            : "-"}
                        </td>

                        <td>
                          {movement.reference || "-"}
                        </td>

                        <td>
                          {movement.notes || "-"}
                        </td>

                        <td>
                          {movement.created_at
                            ? new Date(
                                movement.created_at
                              ).toLocaleString()
                            : "-"}
                        </td>

                        {canCreate && (
                          <td className="action-buttons">

                            {isAdmin && (
                              <>
                                <button
                                  className="edit-button"
                                  onClick={() =>
                                    handleEdit(movement)
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  className="delete-button"
                                  onClick={() =>
                                    handleDelete(
                                      movement.id
                                    )
                                  }
                                >
                                  Delete
                                </button>
                              </>
                            )}

                            {!isAdmin && (
                              <span className="read-only-label">
                                Create only
                              </span>
                            )}

                          </td>
                        )}
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default StockMovements;