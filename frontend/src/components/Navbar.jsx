import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav style={navbar}>
      {/* LOGO */}
      <div style={logo}>ExpenseTracker</div>

      {/* NAV LINKS */}
      <div style={navLinks}>
        <Link to="/" style={linkStyle}>
          Home
        </Link>

        <Link to="/expenses" style={linkStyle}>
          Expenses
        </Link>

        <Link to="/budget" style={linkStyle}>
          Budget
        </Link>

        <Link to="/goals" style={linkStyle}>
          Goals
        </Link>

        <Link to="/intelligence" style={linkStyle}>
          Intelligence
        </Link>

        <Link to="/dashboard" style={linkStyle}>
          Dashboard
        </Link>

        <Link to="/export" style={linkStyle}>
          Export
        </Link>
      </div>

      {/* LOGOUT */}
      <button onClick={logout} style={logoutButton}>
        Logout
      </button>
    </nav>
  );
}

/* ================= STYLES ================= */

const navbar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "15px 30px",
  background: "#1e293b",
  borderRadius: "14px",
  marginBottom: "25px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  flexWrap: "wrap",
  gap: "15px",
};

const logo = {
  color: "white",
  fontSize: "22px",
  fontWeight: "bold",
};

const navLinks = {
  display: "flex",
  gap: "20px",
  flexWrap: "wrap",
};

const linkStyle = {
  color: "#e2e8f0",
  textDecoration: "none",
  fontWeight: "500",
  transition: "0.2s",
};

const logoutButton = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};