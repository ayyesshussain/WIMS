import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Categories() {
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  const [editingId, setEditingId] = useState(null);

  const isAdmin = user?.role === "admin";

  const fetchCategories = async () => {
    try {
      const response = await api.get("/api/categories");
      setCategories(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load categories"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
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
      description: "",
      is_active: true,
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(
          `/api/categories/${editingId}`,
          form
        );
      } else {
        await api.post("/api/categories", form);
      }

      resetForm();
      fetchCategories();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Operation failed"
      );
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);

    setForm({
      name: category.name,
      description: category.description || "",
      is_active: category.is_active,
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/api/categories/${id}`);
      fetchCategories();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to delete category"
      );
    }
  };

  if (loading) {
    return <p>Loading categories...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Categories</h1>
          <p>Manage product categories</p>
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
              ? "Update Category"
              : "Create Category"}
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
                required
              />
            </div>

            <div>
              <label>Description</label>

              <input
                type="text"
                name="description"
                value={form.description}
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
              <th>Description</th>
              <th>Status</th>

              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin ? 5 : 4}
                  className="empty-table"
                >
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.name}</td>
                  <td>
                    {category.description || "-"}
                  </td>

                  <td>
                    <span
                      className={
                        category.is_active
                          ? "status-active"
                          : "status-inactive"
                      }
                    >
                      {category.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  {isAdmin && (
                    <td className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() =>
                          handleEdit(category)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          handleDelete(category.id)
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

export default Categories;