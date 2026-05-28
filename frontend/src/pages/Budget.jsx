import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Budget() {
  const [data, setData] = useState(null);

  const [form, setForm] = useState({
    category: "",
    monthly_limit: "",
  });

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchBudget();
  }, []);

  const fetchBudget = async () => {
    try {
      const res = await api.get("/budgets/status");
      setData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await api.put(`/budgets/${editId}`, form);
        setEditId(null);
      } else {
        await api.post("/budgets/", {
          category: form.category,
          monthly_limit: Number(form.monthly_limit),
        });
      }

      setForm({ category: "", monthly_limit: "" });
      fetchBudget();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/budgets/${id}`);
      fetchBudget();
    } catch (err) {
      console.log(err);
    }
  };

  const handleEdit = (b) => {
    setForm({
      category: b.category,
      monthly_limit: b.budget_limit,
    });
    setEditId(b.id);
  };

  if (!data) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={page}>
      <Navbar />

      {/* HEADER */}
      <div style={header}>
        <h1 style={title}>💰 Budget Overview</h1>
        <p style={subtitle}>
          Track and manage your monthly spending limits
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div style={grid}>
        <Card label="Total Budget" value={`Rs ${data.summary.total_budget}`} />
        <Card label="Total Spent" value={`Rs ${data.summary.total_spent}`} />
        <Card label="Remaining" value={`Rs ${data.summary.total_remaining}`} />
        <Card label="Usage" value={`${data.summary.overall_percent_used}%`} />
      </div>

      {/* STATUS */}
      <div
        style={{
          ...statusBox,
          background:
            data.summary.overall_status === "Over_Budget"
              ? "#ffe5e5"
              : data.summary.overall_status === "Warning"
              ? "#fff7d6"
              : "#e8f8ec",
          color:
            data.summary.overall_status === "Over_Budget"
              ? "#b00020"
              : data.summary.overall_status === "Warning"
              ? "#8a6d00"
              : "#1b7f3b",
        }}
      >
        <h2 style={{ margin: 0 }}>{data.summary.overall_status}</h2>
      </div>

      {/* FORM */}
      <div style={formBox}>
        <h3 style={{ marginBottom: 10 }}>
          {editId ? "✏️ Update Budget" : "➕ Add Budget"}
        </h3>

        <form onSubmit={handleSubmit} style={form}>
          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
            style={input}
          />

          <input
            placeholder="Monthly Limit"
            type="number"
            value={form.monthly_limit}
            onChange={(e) =>
              setForm({ ...form, monthly_limit: e.target.value })
            }
            style={input}
          />

          <button style={btn}>
            {editId ? "Update" : "Create"}
          </button>
        </form>
      </div>

      {/* CATEGORY BUDGETS */}
      <div style={section}>
        <h2 style={sectionTitle}>📂 Category Budgets</h2>

        <div style={budgetGrid}>
          {data.budgets.map((b, i) => (
            <div key={i} style={cardBox}>
              {/* header */}
              <div style={cardHeader}>
                <h3 style={{ margin: 0 }}>{b.category}</h3>

                <span style={getBadge(b.status)}>
                  {b.status}
                </span>
              </div>

              {/* info */}
              <div style={info}>
                <p>Limit: Rs {b.budget_limit}</p>
                <p>Spent: Rs {b.spent}</p>
                <p>Remaining: Rs {b.remaining}</p>
                <p>Used: {b.percent_used}%</p>
              </div>

              {/* progress */}
              <div style={bar}>
                <div
                  style={{
                    width: `${Math.min(b.percent_used, 100)}%`,
                    height: "100%",
                    background: getColor(b.status),
                  }}
                />
              </div>

              {/* actions */}
              <div style={actions}>
                <button onClick={() => handleEdit(b)} style={editBtn}>
                  Edit
                </button>
                <button onClick={() => handleDelete(b.id)} style={delBtn}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

function Card({ label, value }) {
  return (
    <div style={summaryCard}>
      <p style={{ margin: 0, color: "gray", fontSize: 14 }}>
        {label}
      </p>
      <h2 style={{ margin: "8px 0 0 0" }}>{value}</h2>
    </div>
  );
}

/* ================= HELPERS ================= */

function getBadge(status) {
  const base = {
    padding: "5px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "bold",
  };

  if (status === "Over_budget")
    return { ...base, background: "#ef4444", color: "white" };

  if (status === "Warning")
    return { ...base, background: "#facc15", color: "black" };

  return { ...base, background: "#22c55e", color: "white" };
}

function getColor(status) {
  if (status === "Over_budget") return "#ef4444";
  if (status === "Warning") return "#facc15";
  return "#22c55e";
}

/* ================= STYLES ================= */

const page = {
  padding: "25px",
  background: "#f4f7fb",
  minHeight: "100vh",
};

const header = {
  marginBottom: "20px",
};

const title = {
  margin: 0,
};

const subtitle = {
  color: "gray",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "15px",
  marginBottom: "15px",
};

const summaryCard = {
  background: "white",
  padding: "15px",
  borderRadius: "12px",
  boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
};

const statusBox = {
  padding: "15px",
  borderRadius: "12px",
  textAlign: "center",
  fontWeight: "bold",
  marginBottom: "20px",
};

const formBox = {
  background: "white",
  padding: "15px",
  borderRadius: "12px",
  marginBottom: "20px",
};

const form = {
  display: "flex",
  gap: "10px",
};

const input = {
  flex: 1,
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ddd",
};

const btn = {
  padding: "10px 15px",
  border: "none",
  background: "#2563eb",
  color: "white",
  borderRadius: "8px",
  cursor: "pointer",
};

const section = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
};

const sectionTitle = {
  marginBottom: "15px",
};

const budgetGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "15px",
};

const cardBox = {
  background: "#f9fafb",
  padding: "15px",
  borderRadius: "12px",
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "10px",
};

const info = {
  fontSize: 14,
  color: "#444",
  lineHeight: 1.6,
};

const bar = {
  height: "8px",
  background: "#e5e7eb",
  borderRadius: "10px",
  overflow: "hidden",
  marginTop: "10px",
};

const actions = {
  display: "flex",
  gap: "10px",
  marginTop: "10px",
};

const editBtn = {
  flex: 1,
  padding: "6px",
  border: "none",
  borderRadius: "6px",
  background: "#3b82f6",
  color: "white",
  cursor: "pointer",
};

const delBtn = {
  flex: 1,
  padding: "6px",
  border: "none",
  borderRadius: "6px",
  background: "#ef4444",
  color: "white",
  cursor: "pointer",
};