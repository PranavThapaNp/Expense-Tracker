import { useState, useContext } from "react";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      login(res.data.access_token);

      navigate("/");
    } catch (err) {
      console.log(err.response?.data);
      alert("Login failed");
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={title}>Expense Tracker</h1>
        <p style={subtitle}>Welcome back 👋</p>

        <form onSubmit={handleSubmit} style={formStyle}>
          <input
            type="email"
            placeholder="Email"
            style={input}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            style={input}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <button type="submit" style={button}>
            Login
          </button>
        </form>

        <p style={footerText}>
          Don’t have an account?{" "}
          <Link to="/register" style={link}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background:
    "linear-gradient(to right, #141e30, #243b55)",
};

const card = {
  background: "white",
  padding: "40px",
  borderRadius: "15px",
  width: "350px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

const title = {
  textAlign: "center",
  marginBottom: "5px",
};

const subtitle = {
  textAlign: "center",
  color: "gray",
  marginBottom: "30px",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const input = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "14px",
};

const button = {
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  background: "#243b55",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};

const footerText = {
  textAlign: "center",
  marginTop: "20px",
};

const link = {
  color: "#243b55",
  fontWeight: "bold",
  textDecoration: "none",
};