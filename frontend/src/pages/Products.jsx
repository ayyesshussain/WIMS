import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Products() {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [barcode, setBarcode] = useState("");
  const [barcodeResult, setBarcodeResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    barcode: "",
    category_id: "",
    purchase_price: "",
    selling_price: "",
    unit: "piece",
    is_active: true,
  });

  const isAdmin = user?.role === "admin";

  const canCreate =
    user?.role === "admin";
  const fetchProducts = async (searchValue = "") => {
    try {
      setLoading(true);

      const response = await api.get("/api/products", {
        params: searchValue
          ? { search: searchValue }
          : {},
      });

      setProducts(response.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/api/categories");
      setCategories(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load categories"
      );
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    fetchProducts(search);
  };

  const clearSearch = () => {
    setSearch("");
    setError("");
    setSuccess("");

    fetchProducts();
  };

  const handleBarcodeLookup = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setBarcodeResult(null);

    if (!barcode.trim()) {
      setError("Please enter a barcode.");
      return;
    }

    try {
      const response = await api.get(
        `/api/products/barcode/${barcode}`
      );

      setBarcodeResult(response.data);
    } catch (err) {
      setBarcodeResult(null);

      setError(
        err.response?.data?.detail ||
          "Product not found"
      );
    }
  };

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  const resetForm = () => {
    setForm({
      name: "",
      sku: "",
      barcode: "",
      category_id: "",
      purchase_price: "",
      selling_price: "",
      unit: "piece",
      is_active: true,
    });

    setEditingId(null);
  };

  const getErrorMessage = (err) => {
    const detail = err.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item) => item.msg)
        .join(", ");
    }

    if (detail && typeof detail === "object") {
      return JSON.stringify(detail);
    }

    return "Product operation failed";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.sku.trim()) {
      setError("SKU is required.");
      return;
    }

    if (!form.barcode.trim()) {
      setError("Barcode is required.");
      return;
    }

    if (!form.category_id) {
      setError("Please select a category.");
      return;
    }

    if (
      Number(form.purchase_price) < 0
    ) {
      setError(
        "Purchase price cannot be negative."
      );
      return;
    }

    if (
      Number(form.selling_price) < 0
    ) {
      setError(
        "Selling price cannot be negative."
      );
      return;
    }

    if (!form.unit.trim()) {
      setError("Unit is required.");
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      sku: form.sku.trim(),
      barcode: form.barcode.trim(),
      category_id: Number(
        form.category_id
      ),
      purchase_price: Number(
        form.purchase_price
      ),
      selling_price: Number(
        form.selling_price
      ),
      unit: form.unit.trim(),
    };

    try {
      if (editingId) {
        await api.put(
          `/api/products/${editingId}`,
          payload
        );

        setSuccess(
          "Product updated successfully."
        );
      } else {
        await api.post(
          "/api/products",
          payload
        );

        setSuccess(
          "Product created successfully."
        );
      }

      resetForm();
      await fetchProducts();

    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    }
  };

  const handleEdit = (product) => {
    setError("");
    setSuccess("");

    setEditingId(product.id);

    setForm({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      category_id: product.category_id,
      purchase_price:
        product.purchase_price,
      selling_price:
        product.selling_price,
      unit: product.unit,
      is_active: product.is_active,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    setError("");
    setSuccess("");

    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/api/products/${id}`
      );

      setSuccess(
        "Product deleted successfully."
      );

      await fetchProducts();

    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>

        <p>
          Manage products, search inventory
          items, and perform barcode lookup
        </p>
      </div>

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      {success && (
        <div className="page-success">
          {success}
        </div>
      )}

      <div className="form-card">
        <h2>Search Products</h2>

        <form
          onSubmit={handleSearch}
          className="search-form"
        >
          <input
            type="text"
            placeholder="Search by name, SKU or barcode"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <button
            type="submit"
            className="primary-button"
          >
            Search
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={clearSearch}
          >
            Clear
          </button>
        </form>
      </div>

      <div className="form-card">
        <h2>Barcode Lookup</h2>

        <form
          onSubmit={handleBarcodeLookup}
          className="search-form"
        >
          <input
            type="text"
            placeholder="Enter or scan barcode"
            value={barcode}
            onChange={(e) =>
              setBarcode(e.target.value)
            }
          />

          <button
            type="submit"
            className="primary-button"
          >
            Find Product
          </button>
        </form>

        {barcodeResult && (
          <div className="barcode-result">
            <strong>
              {barcodeResult.name}
            </strong>

            <span>
              SKU:{" "}
              {barcodeResult.sku}
            </span>

            <span>
              Barcode:{" "}
              {barcodeResult.barcode}
            </span>

            <span>
              Selling Price: Rs.{" "}
              {
                barcodeResult.selling_price
              }
            </span>
          </div>
        )}
      </div>

      {canCreate && (
        <div className="form-card">
          <h2>
            {editingId
              ? "Update Product"
              : "Create Product"}
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
              <label>SKU</label>

              <input
                type="text"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Barcode</label>

              <input
                type="text"
                name="barcode"
                value={form.barcode}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Category</label>

              <select
                name="category_id"
                value={
                  form.category_id
                }
                onChange={
                  handleChange
                }
                required
              >
                <option value="">
                  Select category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {
                        category.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label>
                Purchase Price
              </label>

              <input
                type="number"
                name="purchase_price"
                value={
                  form.purchase_price
                }
                onChange={
                  handleChange
                }
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label>
                Selling Price
              </label>

              <input
                type="number"
                name="selling_price"
                value={
                  form.selling_price
                }
                onChange={
                  handleChange
                }
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label>Unit</label>

              <input
                type="text"
                name="unit"
                value={form.unit}
                onChange={
                  handleChange
                }
                placeholder="piece"
                required
              />
            </div>

            {isAdmin &&
              editingId && (
                <div className="checkbox-field">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={
                      form.is_active
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <label>
                    Active
                  </label>
                </div>
              )}

            <div className="form-actions">
              <button
                type="submit"
                className="primary-button"
              >
                {editingId
                  ? "Update Product"
                  : "Create Product"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    resetForm
                  }
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <h2>Product List</h2>

        {loading ? (
          <p>
            Loading products...
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Barcode</th>
                  <th>Category</th>
                  <th>
                    Purchase Price
                  </th>
                  <th>
                    Selling Price
                  </th>
                  <th>Unit</th>
                  <th>Status</th>

                  {isAdmin && (
                    <th>
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={
                        isAdmin
                          ? 10
                          : 9
                      }
                      className="empty-table"
                    >
                      No products
                      found.
                    </td>
                  </tr>
                ) : (
                  products.map(
                    (product) => (
                      <tr
                        key={
                          product.id
                        }
                      >
                        <td>
                          {
                            product.id
                          }
                        </td>

                        <td>
                          {
                            product.name
                          }
                        </td>

                        <td>
                          {
                            product.sku
                          }
                        </td>

                        <td>
                          {
                            product.barcode
                          }
                        </td>

                        <td>
                          {categories.find(
                            (
                              category
                            ) =>
                              category.id ===
                              product.category_id
                          )?.name ||
                            product.category_id}
                        </td>

                        <td>
                          Rs.{" "}
                          {
                            product.purchase_price
                          }
                        </td>

                        <td>
                          Rs.{" "}
                          {
                            product.selling_price
                          }
                        </td>

                        <td>
                          {
                            product.unit
                          }
                        </td>

                        <td>
                          <span
                            className={
                              product.is_active
                                ? "status-active"
                                : "status-inactive"
                            }
                          >
                            {
                              product.is_active
                                ? "Active"
                                : "Inactive"
                            }
                          </span>
                        </td>

                        {isAdmin && (
                          <td className="action-buttons">
                            <button
                              className="edit-button"
                              onClick={() =>
                                handleEdit(
                                  product
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="delete-button"
                              onClick={() =>
                                handleDelete(
                                  product.id
                                )
                              }
                            >
                              Delete
                            </button>
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

export default Products;