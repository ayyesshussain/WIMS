import { useEffect, useState } from "react";
import api from "../api/axios";


function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "inventory_staff",
  });


  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/api/users");

      setUsers(response.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchUsers();
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");

      await api.post("/api/users", form);

      setSuccess(
        "Staff user created successfully"
      );

      setForm({
        full_name: "",
        email: "",
        password: "",
        role: "inventory_staff",
      });

      await fetchUsers();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to create user"
      );
    }
  };


  const toggleUserStatus = async (user) => {
    try {
      setError("");
      setSuccess("");

      await api.put(
        `/api/users/${user.id}`,
        {
          is_active: !user.is_active,
        }
      );

      setSuccess(
        user.is_active
          ? "User deactivated successfully"
          : "User activated successfully"
      );

      await fetchUsers();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to update user"
      );
    }
  };


  const formatRole = (role) => {
    switch (role) {
      case "warehouse_manager":
        return "Warehouse Manager";

      case "sales_staff":
        return "Sales Staff";

      case "inventory_staff":
        return "Inventory Staff";

      case "admin":
        return "Admin";

      default:
        return role;
    }
  };


  return (
    <div className="users-page">

      {/* PAGE HEADER */}
      <div className="page-header">
        <h1>User Management</h1>

        <p>
          Create and manage warehouse staff accounts
        </p>
      </div>


      {/* ERROR MESSAGE */}
      {error && (
        <div className="page-error">
          {error}
        </div>
      )}


      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="page-success">
          {success}
        </div>
      )}


      {/* CREATE USER CARD */}
      <div className="users-card">

        <h2>Create Staff User</h2>

        <form
          onSubmit={handleCreateUser}
          className="users-form"
        >

          <div className="form-group">
            <label>Full Name</label>

            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Employee name"
              required
            />
          </div>


          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="employee@company.com"
              required
            />
          </div>


          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Set user password"
              required
            />
          </div>


          <div className="form-group">
            <label>Role</label>

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="inventory_staff">
                Inventory Staff
              </option>

              <option value="sales_staff">
                Sales Staff
              </option>

              <option value="warehouse_manager">
                Warehouse Manager
              </option>
            </select>
          </div>


          <div className="users-form-action">
            <button
              type="submit"
              className="primary-button"
            >
              Create User
            </button>
          </div>

        </form>
      </div>


      {/* USERS TABLE CARD */}
      <div className="users-card">

        <div className="users-table-header">

          <h2>Staff Users</h2>

          <span className="users-count">
            {users.length} users
          </span>

        </div>


        {loading ? (

          <p>Loading users...</p>

        ) : users.length === 0 ? (

          <div className="notification-empty">
            <h3>No Staff Users</h3>

            <p>
              Create your first staff account above.
            </p>
          </div>

        ) : (

          <div className="users-table-wrapper">

            <table className="users-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>


              <tbody>

                {users.map((user) => (

                  <tr key={user.id}>

                    <td>
                      {user.id}
                    </td>


                    <td>
                      <strong>
                        {user.full_name}
                      </strong>
                    </td>


                    <td>
                      {user.email}
                    </td>


                    <td>
                      <span className="role-badge">
                        {formatRole(user.role)}
                      </span>
                    </td>


                    <td>
                      <span
                        className={
                          user.is_active
                            ? "user-status active"
                            : "user-status inactive"
                        }
                      >
                        {user.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>


                    <td>
                      {user.created_at
                        ? new Date(
                            user.created_at
                          ).toLocaleString()
                        : "-"}
                    </td>


                    <td>

                      {user.role === "admin" ? (

                        <span className="protected-text">
                          Protected
                        </span>

                      ) : (

                        <button
                          type="button"
                          className={
                            user.is_active
                              ? "deactivate-button"
                              : "activate-button"
                          }
                          onClick={() =>
                            toggleUserStatus(user)
                          }
                        >
                          {user.is_active
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}


export default Users;