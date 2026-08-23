import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Suppliers() {
  const { user } = useAuth();

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    company_name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    is_active: true,
  });

  const isAdmin = user?.role === "admin";

  const canManage =
    user?.role === "admin" ||
    user?.role === "warehouse_manager";

  const fetchSuppliers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/api/suppliers");

      setSuppliers(response.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load suppliers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
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
      company_name: "",
      contact_person: "",
      phone: "",
      email: "",
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
          `/api/suppliers/${editingId}`,
          form
        );
      } else {
        await api.post("/api/suppliers", form);
      }

      resetForm();
      fetchSuppliers();
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Supplier operation failed"
      );
    }
  };

  const handleEdit = (supplier) => {
    setEditingId(supplier.id);

    setForm({
      company_name: supplier.company_name,
      contact_person:
        supplier.contact_person || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      is_active: supplier.is_active,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this supplier?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/api/suppliers/${id}`);

      fetchSuppliers();
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to delete supplier"
      );
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Suppliers</h1>
        <p>
          Manage supplier information and contacts
        </p>
      </div>

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      {canManage && (
        <div className="form-card">
          <h2>
            {editingId
              ? "Update Supplier"
              : "Create Supplier"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="module-form"
          >
            <div>
              <label>Company Name</label>

              <input
                type="text"
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Contact Person</label>

              <input
                type="text"
                name="contact_person"
                value={form.contact_person}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Phone</label>

              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Email</label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Address</label>

              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
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
                {editingId
                  ? "Update Supplier"
                  : "Create Supplier"}
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
        <h2>Supplier List</h2>

        {loading ? (
          <p>Loading suppliers...</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Company</th>
                  <th>Contact Person</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Status</th>

                  {canManage && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {suppliers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={canManage ? 8 : 7}
                      className="empty-table"
                    >
                      No suppliers found.
                    </td>
                  </tr>
                ) : (
                  suppliers.map((supplier) => (
                    <tr key={supplier.id}>
                      <td>{supplier.id}</td>

                      <td>
                        {supplier.company_name}
                      </td>

                      <td>
                        {supplier.contact_person || "-"}
                      </td>

                      <td>
                        {supplier.phone || "-"}
                      </td>

                      <td>
                        {supplier.email || "-"}
                      </td>

                      <td>
                        {supplier.address || "-"}
                      </td>

                      <td>
                        <span
                          className={
                            supplier.is_active
                              ? "status-active"
                              : "status-inactive"
                          }
                        >
                          {supplier.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      {canManage && (
                        <td className="action-buttons">

                          <button
                            className="edit-button"
                            onClick={() =>
                              handleEdit(supplier)
                            }
                          >
                            Edit
                          </button>

                          {isAdmin && (
                            <button
                              className="delete-button"
                              onClick={() =>
                                handleDelete(
                                  supplier.id
                                )
                              }
                            >
                              Delete
                            </button>
                          )}

                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Suppliers;