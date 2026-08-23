import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Sales() {
  const { user } = useAuth();

  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    customer_name: "",
    warehouse_id: "",
    reference: "",
    notes: "",
  });

  const [items, setItems] = useState([
    {
      product_id: "",
      quantity: 1,
      unit_price: "",
    },
  ]);

  const canCreate =
    user?.role === "admin" ||
    user?.role === "sales_staff";

  // ============================================================
  // FETCH DATA
  // ============================================================

  const fetchData = async () => {
    try {
      setLoading(true);

      const [
        salesResponse,
        productsResponse,
        warehousesResponse,
      ] = await Promise.all([
        api.get("/api/sales"),
        api.get("/api/products"),
        api.get("/api/warehouses"),
      ]);

      setSales(salesResponse.data);
      setProducts(productsResponse.data);
      setWarehouses(warehousesResponse.data);

      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load sales data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ============================================================
  // FORM HANDLING
  // ============================================================

  const handleFormChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (
    index,
    field,
    value
  ) => {
    const updated = [...items];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    // Automatically load selling price
    // when product is selected
    if (field === "product_id") {
      const product = products.find(
        (p) => p.id === Number(value)
      );

      if (product) {
        updated[index].unit_price =
          product.selling_price;
      }
    }

    setItems(updated);
  };

  // ============================================================
  // SALE ITEMS
  // ============================================================

  const addItem = () => {
    setItems([
      ...items,
      {
        product_id: "",
        quantity: 1,
        unit_price: "",
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      return;
    }

    setItems(
      items.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  };

  // ============================================================
  // TOTAL
  // ============================================================

  const totalAmount = useMemo(() => {
    return items.reduce((total, item) => {
      const quantity =
        Number(item.quantity) || 0;

      const price =
        Number(item.unit_price) || 0;

      return total + quantity * price;
    }, 0);
  }, [items]);

  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm = () => {
    setForm({
      customer_name: "",
      warehouse_id: "",
      reference: "",
      notes: "",
    });

    setItems([
      {
        product_id: "",
        quantity: 1,
        unit_price: "",
      },
    ]);
  };

  // ============================================================
  // CREATE SALE
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.warehouse_id) {
      setError("Please select a warehouse.");
      return;
    }

    if (
      items.some(
        (item) =>
          !item.product_id ||
          Number(item.quantity) <= 0 ||
          Number(item.unit_price) <= 0
      )
    ) {
      setError(
        "Please enter valid sale item information."
      );
      return;
    }

    const payload = {
      customer_name:
        form.customer_name || null,

      warehouse_id:
        Number(form.warehouse_id),

      reference:
        form.reference || null,

      notes:
        form.notes || null,

      items: items.map((item) => ({
        product_id:
          Number(item.product_id),

        quantity:
          Number(item.quantity),

        unit_price:
          Number(item.unit_price),
      })),
    };

    try {
      await api.post(
        "/api/sales",
        payload
      );

      setSuccess(
        "Sale completed successfully. Inventory stock has been updated."
      );

      resetForm();

      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to create sale"
      );
    }
  };

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  const getProductName = (productId) => {
    const product = products.find(
      (item) => item.id === productId
    );

    return (
      product?.name ||
      `Product ${productId}`
    );
  };

  const getWarehouseName = (
    warehouseId
  ) => {
    const warehouse = warehouses.find(
      (item) =>
        item.id === Number(warehouseId)
    );

    return (
      warehouse?.name ||
      `Warehouse ${warehouseId}`
    );
  };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div>

      {/* PAGE HEADER */}

      <div className="page-header">
        <h1>Sales</h1>

        <p>
          Create customer sales and view sales history
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="page-success">
          {success}
        </div>
      )}

      {/* ======================================================
          CREATE SALE
      ====================================================== */}

      {canCreate && (
        <div className="form-card">

          <h2>Create Sale</h2>

          <form onSubmit={handleSubmit}>

            <div className="module-form">

              {/* CUSTOMER */}

              <div>
                <label>
                  Customer Name
                </label>

                <input
                  type="text"
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleFormChange}
                  placeholder="Customer name"
                />
              </div>

              {/* WAREHOUSE */}

              <div>
                <label>
                  Selling Warehouse
                </label>

                <select
                  name="warehouse_id"
                  value={form.warehouse_id}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">
                    Select warehouse
                  </option>

                  {warehouses
                    .filter(
                      (warehouse) =>
                        warehouse.is_active
                    )
                    .map((warehouse) => (
                      <option
                        key={warehouse.id}
                        value={warehouse.id}
                      >
                        {warehouse.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* REFERENCE */}

              <div>
                <label>
                  Reference
                </label>

                <input
                  type="text"
                  name="reference"
                  value={form.reference}
                  onChange={handleFormChange}
                  placeholder="SALE-2026-001"
                />
              </div>

              {/* STATUS */}

              <div>
                <label>
                  Status
                </label>

                <input
                  type="text"
                  value="COMPLETED"
                  disabled
                />
              </div>

              {/* NOTES */}

              <div>
                <label>
                  Notes
                </label>

                <input
                  type="text"
                  name="notes"
                  value={form.notes}
                  onChange={handleFormChange}
                  placeholder="Optional notes"
                />
              </div>

            </div>

            {/* ==================================================
                SALE ITEMS
            ================================================== */}

            <div className="purchase-items-section">

              <div className="purchase-items-header">

                <h3>
                  Sale Items
                </h3>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={addItem}
                >
                  + Add Item
                </button>

              </div>

              {items.map(
                (item, index) => (
                  <div
                    className="purchase-item-row"
                    key={index}
                  >

                    {/* PRODUCT */}

                    <div>
                      <label>
                        Product
                      </label>

                      <select
                        value={
                          item.product_id
                        }
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "product_id",
                            e.target.value
                          )
                        }
                        required
                      >
                        <option value="">
                          Select product
                        </option>

                        {products.map(
                          (product) => (
                            <option
                              key={
                                product.id
                              }
                              value={
                                product.id
                              }
                            >
                              {
                                product.name
                              }
                            </option>
                          )
                        )}

                      </select>
                    </div>

                    {/* QUANTITY */}

                    <div>
                      <label>
                        Quantity
                      </label>

                      <input
                        type="number"
                        value={
                          item.quantity
                        }
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            e.target.value
                          )
                        }
                        min="1"
                        required
                      />
                    </div>

                    {/* UNIT PRICE */}

                    <div>
                      <label>
                        Unit Price
                      </label>

                      <input
                        type="number"
                        value={
                          item.unit_price
                        }
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "unit_price",
                            e.target.value
                          )
                        }
                        min="0.01"
                        step="0.01"
                        required
                      />
                    </div>

                    {/* ITEM TOTAL */}

                    <div>
                      <label>
                        Total
                      </label>

                      <div className="item-total">

                        Rs.{" "}

                        {(
                          Number(
                            item.quantity ||
                              0
                          ) *
                          Number(
                            item.unit_price ||
                              0
                          )
                        ).toFixed(2)}

                      </div>
                    </div>

                    {/* REMOVE */}

                    <div className="purchase-remove-box">

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() =>
                          removeItem(
                            index
                          )
                        }
                        disabled={
                          items.length ===
                          1
                        }
                      >
                        Remove
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>

            {/* TOTAL SALE */}

            <div className="purchase-summary">

              <strong>
                Total Sale:
              </strong>

              <span>
                Rs.{" "}
                {totalAmount.toFixed(
                  2
                )}
              </span>

            </div>

            {/* CREATE */}

            <button
              type="submit"
              className="primary-button"
            >
              Complete Sale
            </button>

          </form>

        </div>
      )}

      {/* ======================================================
          SALES HISTORY
      ====================================================== */}

      <div className="table-card">

        <h2>
          Sales History
        </h2>

        {loading ? (
          <p>
            Loading sales...
          </p>
        ) : (

          <div className="table-wrapper">

            <table className="data-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Warehouse</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Notes</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>

                {sales.length === 0 ? (

                  <tr>
                    <td
                      colSpan="9"
                      className="empty-table"
                    >
                      No sales found.
                    </td>
                  </tr>

                ) : (

                  sales.map((sale) => (

                    <tr key={sale.id}>

                      <td>
                        {sale.id}
                      </td>

                      <td>
                        {sale.reference ||
                          "-"}
                      </td>

                      <td>
                        {sale.customer_name ||
                          "-"}
                      </td>

                      <td>
                        {getWarehouseName(
                          sale.warehouse_id
                        )}
                      </td>

                      <td>
                        Rs.{" "}
                        {sale.total_amount}
                      </td>

                      <td>
                        <span className="movement-badge">
                          {sale.status}
                        </span>
                      </td>

                      <td>
                        {sale.items?.length ||
                          0}
                      </td>

                      <td>
                        {sale.notes || "-"}
                      </td>

                      <td>
                        {sale.created_at
                          ? new Date(
                              sale.created_at
                            ).toLocaleString()
                          : "-"}
                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ======================================================
          SALE ITEM DETAILS
      ====================================================== */}

      <div className="table-card">

        <h2>
          Sale Item Details
        </h2>

        {sales.length === 0 ? (

          <p>
            No sale item details found.
          </p>

        ) : (

          sales.map((sale) => (

            <div
              key={sale.id}
              className="purchase-detail-block"
            >

              <h3>
                {sale.reference ||
                  `Sale #${sale.id}`}
                {" — "}
                {sale.customer_name ||
                  "Customer"}
                {" → "}
                {getWarehouseName(
                  sale.warehouse_id
                )}
              </h3>

              <div className="table-wrapper">

                <table className="data-table">

                  <thead>
                    <tr>
                      <th>
                        Product
                      </th>

                      <th>
                        Quantity
                      </th>

                      <th>
                        Unit Price
                      </th>

                      <th>
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {sale.items?.map(
                      (item) => (

                        <tr key={item.id}>

                          <td>
                            {getProductName(
                              item.product_id
                            )}
                          </td>

                          <td>
                            {item.quantity}
                          </td>

                          <td>
                            Rs.{" "}
                            {item.unit_price}
                          </td>

                          <td>
                            Rs.{" "}
                            {item.total_price}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          ))

        )}

      </div>

    </div>
  );
}

export default Sales;