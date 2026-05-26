import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav style={{ display: "flex", gap: "10px" }}>
      <Link to="/">Dashboard</Link>
      <Link to="/expenses">Expenses</Link>
      <Link to="/budget">Budget</Link>
      <Link to="/goals">Goals</Link>
      <Link to="/intelligence">AI</Link>
      <Link to="/export">Export</Link>

      <button onClick={logout}>Logout</button>
    </nav>
  );
}