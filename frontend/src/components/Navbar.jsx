import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatRole = (role) => {
    if (!role) return "";

    return role
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  return (
    <header className="navbar">
      <div>
        <h3>
          Warehouse Inventory Management System
        </h3>
      </div>

      <div className="navbar-user">
        <div className="user-info">
          <strong>{user?.full_name}</strong>

          <span>
            {formatRole(user?.role)}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;