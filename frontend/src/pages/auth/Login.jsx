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
      <div style={cardWrapper}>
        {/* LEFT SIDE */}
        <div style={leftSection}>
          <div style={logoRow}>
            <span style={logoText}>Expense Tracker</span>
          </div>

          <h2 style={title}>LOG IN</h2>

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
              LOG IN
            </button>
          </form>

          <p style={footerText}>
            Don’t have an account?{" "}
            <Link to="/register" style={link}>
              Register
            </Link>
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div style={rightSection}>
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
            alt="login visual"
            style={image}
          />
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#f4f5f7",
  padding: "20px",
};

const cardWrapper = {
  width: "1000px",
  background: "white",
  display: "flex",
  borderRadius: "6px",
  overflow: "hidden",
  boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
};

const leftSection = {
  flex: 1,
  padding: "50px 45px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const rightSection = {
  flex: 1,
};

const image = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const logoRow = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "40px",
};



const logoText = {
  fontSize: "32px",
  fontWeight: "600",
  color: "#2d3748",
};

const title = {
  fontSize: "26px",
  marginBottom: "30px",
  color: "#222",
  letterSpacing: "1px",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "18px",
};

const input = {
  padding: "16px 16px",
  border: "1px solid #dcdcdc",
  borderRadius: "8px",
  fontSize: "14px",
  outline: "none",
};

const button = {
  padding: "12px",
  background: "#1e293b",
  border: "none",
  borderRadius: "4px",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
  marginTop: "10px",
  letterSpacing: "1px",
};

const footerText = {
  marginTop: "20px",
  fontSize: "14px",
  color: "#555",
};

const link = {
  color: "#202e44",
  textDecoration: "none",
  fontWeight: "600",
};


