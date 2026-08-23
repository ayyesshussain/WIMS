import { useEffect, useState } from "react";
import api from "../api/axios";

function InventoryOperations() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [stockForm, setStockForm] = useState({
    product_id: "",
    warehouse_id: "",
    quantity: "",
    reference: "",
    notes: "",
    unit_cost: "",
  });

  const [adjustForm, setAdjustForm] = useState({
    product_id: "",
    warehouse_id: "",
    new_quantity: "",
    notes: "",
  });

  const [transferForm, setTransferForm] = useState({
    product_id: "",
    from_warehouse_id: "",
    to_warehouse_id: "",
    quantity: "",
    notes: "",
  });

  const fetchData = async () => {
    try {
      const [productsResponse, warehousesResponse] =
        await Promise.all([
          api.get("/api/products"),
          api.get("/api/warehouses"),
        ]);

      setProducts(productsResponse.data);
      setWarehouses(warehousesResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load products or warehouses"
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStockChange = (e) => {
    setStockForm({
      ...stockForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdjustChange = (e) => {
    setAdjustForm({
      ...adjustForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleTransferChange = (e) => {
    setTransferForm({
      ...transferForm,
      [e.target.name]: e.target.value,
    });
  };

  const resetMessages = () => {
    setMessage("");
    setError("");
  };

  const runStockOperation = async (
    endpoint,
    successMessage
  ) => {
    resetMessages();

    const payload = {
      product_id: Number(stockForm.product_id),
      warehouse_id: Number(stockForm.warehouse_id),
      quantity: Number(stockForm.quantity),
      reference: stockForm.reference || null,
      notes: stockForm.notes || null,
      unit_cost: stockForm.unit_cost
        ? Number(stockForm.unit_cost)
        : null,
    };

    try {
      await api.post(endpoint, payload);

      setMessage(successMessage);

      setStockForm({
        product_id: "",
        warehouse_id: "",
        quantity: "",
        reference: "",
        notes: "",
        unit_cost: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Stock operation failed"
      );
    }
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    resetMessages();

    try {
      const response = await api.post(
        "/api/inventory/adjust",
        {
          product_id: Number(adjustForm.product_id),
          warehouse_id: Number(adjustForm.warehouse_id),
          new_quantity: Number(adjustForm.new_quantity),
          notes: adjustForm.notes || null,
        }
      );

      setMessage(
        response.data?.message ||
          "Stock adjusted successfully"
      );

      setAdjustForm({
        product_id: "",
        warehouse_id: "",
        new_quantity: "",
        notes: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Stock adjustment failed"
      );
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    resetMessages();

    try {
      const response = await api.post(
        "/api/inventory/transfer",
        {
          product_id: Number(transferForm.product_id),
          from_warehouse_id: Number(
            transferForm.from_warehouse_id
          ),
          to_warehouse_id: Number(
            transferForm.to_warehouse_id
          ),
          quantity: Number(transferForm.quantity),
          notes: transferForm.notes || null,
        }
      );

      setMessage(
        response.data?.message ||
          "Stock transferred successfully"
      );

      setTransferForm({
        product_id: "",
        from_warehouse_id: "",
        to_warehouse_id: "",
        quantity: "",
        notes: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Stock transfer failed"
      );
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Inventory Operations</h1>
        <p>
          Perform stock in, stock out, damaged stock,
          adjustments and warehouse transfers
        </p>
      </div>

      {message && (
        <div className="page-success">
          {message}
        </div>
      )}

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      <div className="operation-grid">

        <div className="form-card">
          <h2>Stock In</h2>

          <StockForm
            form={stockForm}
            products={products}
            warehouses={warehouses}
            handleChange={handleStockChange}
          />

          <button
            className="primary-button"
            onClick={() =>
              runStockOperation(
                "/api/inventory/stock-in",
                "Stock added successfully"
              )
            }
          >
            Stock In
          </button>
        </div>

        <div className="form-card">
          <h2>Stock Out</h2>

          <StockForm
            form={stockForm}
            products={products}
            warehouses={warehouses}
            handleChange={handleStockChange}
          />

          <button
            className="primary-button"
            onClick={() =>
              runStockOperation(
                "/api/inventory/stock-out",
                "Stock removed successfully"
              )
            }
          >
            Stock Out
          </button>
        </div>

        <div className="form-card">
          <h2>Damaged Stock</h2>

          <StockForm
            form={stockForm}
            products={products}
            warehouses={warehouses}
            handleChange={handleStockChange}
            hideUnitCost
          />

          <button
            className="delete-button"
            onClick={() =>
              runStockOperation(
                "/api/inventory/damaged",
                "Damaged stock recorded successfully"
              )
            }
          >
            Record Damaged
          </button>
        </div>

        <div className="form-card">
          <h2>Stock Adjustment</h2>

          <form
            onSubmit={handleAdjust}
            className="operation-form"
          >
            <select
              name="product_id"
              value={adjustForm.product_id}
              onChange={handleAdjustChange}
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

            <select
              name="warehouse_id"
              value={adjustForm.warehouse_id}
              onChange={handleAdjustChange}
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

            <input
              type="number"
              name="new_quantity"
              placeholder="New quantity"
              value={adjustForm.new_quantity}
              onChange={handleAdjustChange}
              min="0"
              required
            />

            <input
              type="text"
              name="notes"
              placeholder="Notes"
              value={adjustForm.notes}
              onChange={handleAdjustChange}
            />

            <button
              type="submit"
              className="primary-button"
            >
              Adjust Stock
            </button>
          </form>
        </div>

        <div className="form-card">
          <h2>Transfer Stock</h2>

          <form
            onSubmit={handleTransfer}
            className="operation-form"
          >
            <select
              name="product_id"
              value={transferForm.product_id}
              onChange={handleTransferChange}
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

            <select
              name="from_warehouse_id"
              value={transferForm.from_warehouse_id}
              onChange={handleTransferChange}
              required
            >
              <option value="">
                From warehouse
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

            <select
              name="to_warehouse_id"
              value={transferForm.to_warehouse_id}
              onChange={handleTransferChange}
              required
            >
              <option value="">
                To warehouse
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

            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={transferForm.quantity}
              onChange={handleTransferChange}
              min="1"
              required
            />

            <input
              type="text"
              name="notes"
              placeholder="Notes"
              value={transferForm.notes}
              onChange={handleTransferChange}
            />

            <button
              type="submit"
              className="primary-button"
            >
              Transfer Stock
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}


function StockForm({
  form,
  products,
  warehouses,
  handleChange,
  hideUnitCost = false,
}) {
  return (
    <div className="operation-form">

      <select
        name="product_id"
        value={form.product_id}
        onChange={handleChange}
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

      <select
        name="warehouse_id"
        value={form.warehouse_id}
        onChange={handleChange}
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

      <input
        type="number"
        name="quantity"
        placeholder="Quantity"
        value={form.quantity}
        onChange={handleChange}
        min="1"
        required
      />

      {!hideUnitCost && (
        <input
          type="number"
          name="unit_cost"
          placeholder="Unit cost"
          value={form.unit_cost}
          onChange={handleChange}
          min="0"
          step="0.01"
        />
      )}

      <input
        type="text"
        name="reference"
        placeholder="Reference"
        value={form.reference}
        onChange={handleChange}
      />

      <input
        type="text"
        name="notes"
        placeholder="Notes"
        value={form.notes}
        onChange={handleChange}
      />

    </div>
  );
}

export default InventoryOperations;