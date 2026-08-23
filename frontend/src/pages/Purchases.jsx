import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Purchases() {
  const { user } = useAuth();

  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
     supplier_id: "",
     warehouse_id: "",
     reference: "",
     notes: "",
    });

  const [items, setItems] = useState([
    {
      product_id: "",
      quantity: 1,
      unit_cost: "",
    },
  ]);

  const canCreate =
    user?.role === "admin" ||
    user?.role === "warehouse_manager";

  const fetchData = async () => {
    try {
      setLoading(true);

      const [
         purchasesResponse,
         suppliersResponse,
         productsResponse,
         warehousesResponse,
       ] = await Promise.all([
         api.get("/api/purchases"),
         api.get("/api/suppliers"),
         api.get("/api/products"),
         api.get("/api/warehouses"),
       ]);

       setPurchases(purchasesResponse.data);
       setSuppliers(suppliersResponse.data);
       setProducts(productsResponse.data);
       setWarehouses(warehousesResponse.data);

      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load purchases"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        product_id: "",
        quantity: 1,
        unit_cost: "",
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;

    setItems(
      items.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const totalAmount = useMemo(() => {
    return items.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitCost = Number(item.unit_cost) || 0;

      return total + quantity * unitCost;
    }, 0);
  }, [items]);

  const resetForm = () => {
    setForm({
      supplier_id: "",
      warehouse_id: "",
      reference: "",
      notes: "",
    });

    setItems([
      {
        product_id: "",
        quantity: 1,
        unit_cost: "",
      },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const payload = {
      supplier_id: Number(form.supplier_id),
      warehouse_id: Number(form.warehouse_id),
      reference: form.reference,
      notes: form.notes || null,

      items: items.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        unit_cost: Number(item.unit_cost),
      })),
    };

    try {
      await api.post("/api/purchases", payload);

      setSuccess("Purchase created successfully.");

      resetForm();
      fetchData();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to create purchase"
      );
    }
  };

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(
      (item) => item.id === supplierId
    );

    return (
      supplier?.company_name ||
      `Supplier ${supplierId}`
    );
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

  const getProductName = (productId) => {
    const product = products.find(
      (item) => item.id === productId
    );

    return product?.name || `Product ${productId}`;
  };
  const handleReceivePurchase = async (purchaseId) => {
  const confirmed = window.confirm(
    "Are you sure you want to receive this purchase? Inventory will be increased."
  );

  if (!confirmed) return;

  setError("");
  setSuccess("");

  try {
    await api.post(
      `/api/purchases/${purchaseId}/receive`
    );

    setSuccess(
      "Purchase received successfully. Inventory has been updated."
    );

    await fetchData();
  } catch (err) {
    setError(
      err.response?.data?.detail ||
        "Failed to receive purchase"
    );
  }
};
 
  return (
    <div>
      <div className="page-header">
        <h1>Purchases</h1>

        <p>
          View purchase orders and create supplier purchases
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

      {canCreate && (
        <div className="form-card">
          <h2>Create Purchase</h2>

          <form onSubmit={handleSubmit}>
            <div className="module-form">
              <div>
                <label>Supplier</label>

                <select
                  name="supplier_id"
                  value={form.supplier_id}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">
                    Select supplier
                  </option>

                  {suppliers.map((supplier) => (
                    <option
                      key={supplier.id}
                      value={supplier.id}
                    >
                      {supplier.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Receiving Warehouse</label>

                <select
                  name="warehouse_id"
                  value={form.warehouse_id}
                  onChange={handleFormChange}
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
                <label>Reference</label>

                <input
                  type="text"
                  name="reference"
                  value={form.reference}
                  onChange={handleFormChange}
                  placeholder="PO-1001"
                  required
                />
              </div>

              <div>
                <label>Status</label>

                <input
                  type="text"
                  value="PENDING"
                  disabled
                />
              </div>

              <div>
                <label>Notes</label>

                <input
                  type="text"
                  name="notes"
                  value={form.notes}
                  onChange={handleFormChange}
                  placeholder="Optional notes"
                />
              </div>
            </div>

            <div className="purchase-items-section">
              <div className="purchase-items-header">
                <h3>Purchase Items</h3>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={addItem}
                >
                  + Add Item
                </button>
              </div>

              {items.map((item, index) => (
                <div
                  className="purchase-item-row"
                  key={index}
                >
                  <div>
                    <label>Product</label>

                    <select
                      value={item.product_id}
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
                    <label>Quantity</label>

                    <input
                      type="number"
                      value={item.quantity}
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

                  <div>
                    <label>Unit Cost</label>

                    <input
                      type="number"
                      value={item.unit_cost}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "unit_cost",
                          e.target.value
                        )
                      }
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label>Total</label>

                    <div className="item-total">
                      Rs.{" "}
                      {(
                        Number(item.quantity || 0) *
                        Number(item.unit_cost || 0)
                      ).toFixed(2)}
                    </div>
                  </div>

                  <div className="purchase-remove-box">
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        removeItem(index)
                      }
                      disabled={items.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="purchase-summary">
              <strong>Total Purchase:</strong>
              <span>
                Rs. {totalAmount.toFixed(2)}
              </span>
            </div>

            <button
              type="submit"
              className="primary-button"
            >
              Create Purchase
            </button>
          </form>
        </div>
      )}

      <div className="table-card">
        <h2>Purchase History</h2>

        {loading ? (
          <p>Loading purchases...</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Reference</th>
                  <th>Supplier</th>
                  <th>Receiving Warehouse</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Notes</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {purchases.length === 0 ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="empty-table"
                    >
                      No purchases found.
                    </td>
                  </tr>
                ) : (
                  purchases.map((purchase) => (
                    <tr key={purchase.id}>
                      <td>{purchase.id}</td>

                      <td>{purchase.reference}</td>

                      <td>
                        {getSupplierName(
                          purchase.supplier_id
                        )}
                      </td>

                      <td>
                        {getWarehouseName(
                          purchase.warehouse_id
                        )}
                      </td>

                      <td>
                        Rs. {purchase.total_amount}
                      </td>

                      <td>
                        <span className="movement-badge">
                          {purchase.status}
                        </span>
                      </td>

                      <td>
                        {purchase.items?.length || 0}
                      </td>

                      <td>
                        {purchase.notes || "-"}
                      </td>

                      <td>
                        {purchase.created_at
                          ? new Date(
                              purchase.created_at
                            ).toLocaleString()
                          : "-"}
                      </td>
                      <td>
  {purchase.status === "PENDING" ? (
    <button
      type="button"
      className="primary-button"
      onClick={() =>
        handleReceivePurchase(purchase.id)
      }
    >
      Receive Purchase
    </button>
  ) : purchase.status === "COMPLETED" ? (
    <span className="status-active">
      Received
    </span>
  ) : (
    <span className="status-inactive">
      {purchase.status}
    </span>
  )}
</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="table-card">
        <h2>Purchase Item Details</h2>

        {purchases.map((purchase) => (
          <div
            key={purchase.id}
            className="purchase-detail-block"
          >
           <h3>
              {purchase.reference} —{" "}
              {getSupplierName(purchase.supplier_id)}
              {" → "}
              {getWarehouseName(purchase.warehouse_id)}
            </h3>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Cost</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {purchase.items?.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {getProductName(
                          item.product_id
                        )}
                      </td>

                      <td>{item.quantity}</td>

                      <td>
                        Rs. {item.unit_cost}
                      </td>

                      <td>
                        Rs. {item.total_cost}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Purchases;