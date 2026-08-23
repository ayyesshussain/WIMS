import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Warehouses() {
  const { user } = useAuth();

  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    code: "",
    address: "",
    is_active: true,
  });

  const [editingId, setEditingId] = useState(null);

  const isAdmin = user?.role === "admin";

  const fetchWarehouses = async () => {
    try {
      const response = await api.get("/api/warehouses");
      setWarehouses(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load warehouses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const resetForm = () => {
    setForm({
      name: "",
      code: "",
      address: "",
      is_active: true,
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(
          `/api/warehouses/${editingId}`,
          form
        );
      } else {
        await api.post("/api/warehouses", form);
      }

      resetForm();
      fetchWarehouses();
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Warehouse operation failed"
      );
    }
  };

  const handleEdit = (warehouse) => {
    setEditingId(warehouse.id);

    setForm({
      name: warehouse.name,
      code: warehouse.code,
      address: warehouse.address || "",
      is_active: warehouse.is_active,
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this warehouse?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/api/warehouses/${id}`);
      fetchWarehouses();
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to delete warehouse"
      );
    }
  };

  if (loading) {
    return <p>Loading warehouses...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Warehouses</h1>
          <p>
            Manage warehouse locations and storage facilities
          </p>
        </div>
      </div>

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      {isAdmin && (
        <div className="form-card">
          <h2>
            {editingId
              ? "Update Warehouse"
              : "Create Warehouse"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="module-form"
          >
            <div>
              <label>Name</label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Main Warehouse"
                required
              />
            </div>

            <div>
              <label>Code</label>

              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="WH-001"
                required
              />
            </div>

            <div>
              <label>Address</label>

              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Islamabad, Pakistan"
              />
            </div>

            <div className="checkbox-field">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
              />

              <label>Active</label>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="primary-button"
              >
                {editingId ? "Update" : "Create"}
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
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Code</th>
              <th>Address</th>
              <th>Status</th>

              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {warehouses.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin ? 6 : 5}
                  className="empty-table"
                >
                  No warehouses found.
                </td>
              </tr>
            ) : (
              warehouses.map((warehouse) => (
                <tr key={warehouse.id}>
                  <td>{warehouse.id}</td>

                  <td>{warehouse.name}</td>

                  <td>{warehouse.code}</td>

                  <td>
                    {warehouse.address || "-"}
                  </td>

                  <td>
                    <span
                      className={
                        warehouse.is_active
                          ? "status-active"
                          : "status-inactive"
                      }
                    >
                      {warehouse.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  {isAdmin && (
                    <td className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() =>
                          handleEdit(warehouse)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          handleDelete(warehouse.id)
                        }
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Warehouses;