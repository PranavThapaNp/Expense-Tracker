import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [progress, setProgress] = useState({});

  const [form, setForm] = useState({
    name: "",
    target_amount: "",
    target_date: "",
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await api.get("/goals/");
      setGoals(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const createGoal = async (e) => {
    e.preventDefault();

    await api.post("/goals/", {
      name: form.name,
      target_amount: Number(form.target_amount),
      target_date: form.target_date,
    });

    setForm({ name: "", target_amount: "", target_date: "" });
    fetchGoals();
  };

  const deleteGoal = async (id) => {
    await api.delete(`/goals/${id}`);
    fetchGoals();
  };

  const addProgress = async (id) => {
    await api.put(`/goals/${id}/progress`, {
      saved_amount: Number(progress[id] || 0),
    });

    setProgress({ ...progress, [id]: "" });
    fetchGoals();
  };

  return (
    <div style={page}>
      <Navbar />

      {/* HEADER */}
      <div style={header}>
        <h1 style={title}>🎯 Financial Goals</h1>
        <p style={subtitle}>Track and achieve your savings targets</p>
      </div>

      {/* CREATE FORM */}
      <div style={formBox}>
        <h2 style={sectionTitle}>➕ Create New Goal</h2>

        <form onSubmit={createGoal} style={form}>
          <input
            placeholder="Goal Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            style={input}
          />

          {/* ✅ spinner removed */}
          <input
            type="text"
            inputMode="numeric"
            placeholder="Target Amount"
            value={form.target_amount}
            onChange={(e) =>
              setForm({ ...form, target_amount: e.target.value })
            }
            style={input}
          />

          <input
            type="date"
            value={form.target_date}
            onChange={(e) =>
              setForm({ ...form, target_date: e.target.value })
            }
            style={input}
          />

          <button style={btnPrimary}>Create Goal</button>
        </form>
      </div>

      {/* GOALS GRID */}
      <div style={grid}>
        {goals.length === 0 ? (
          <div style={emptyBox}>No goals yet 🎯</div>
        ) : (
          goals.map((g) => {
            const percent =
              g.target_amount > 0
                ? (g.saved_amount / g.target_amount) * 100
                : 0;

            return (
              <div key={g.id} style={card}>
                {/* HEADER */}
                <div style={cardHeader}>
                  <h3 style={{ margin: 0 }}>{g.name}</h3>

                  <button
                    onClick={() => deleteGoal(g.id)}
                    style={deleteBtn}
                  >
                    Delete
                  </button>
                </div>

                {/* INFO */}
                <div style={info}>
                  <p>🎯 Target: Rs {g.target_amount}</p>
                  <p>💰 Saved: Rs {g.saved_amount}</p>
                  <p>
                    📉 Remaining: Rs{" "}
                    {g.target_amount - g.saved_amount}
                  </p>
                  <p>
                    ⚡ Monthly Need: Rs {g.monthly_saving_needed}
                  </p>
                </div>

                {/* PROGRESS BAR */}
                <div style={bar}>
                  <div
                    style={{
                      ...fill,
                      width: `${Math.min(percent, 100)}%`,
                    }}
                  />
                </div>

                <p style={percentText}>
                  {percent.toFixed(2)}% completed
                </p>

                {/* ADD PROGRESS */}
                <div style={progressBox}>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Add savings"
                    value={progress[g.id] || ""}
                    onChange={(e) =>
                      setProgress({
                        ...progress,
                        [g.id]: e.target.value,
                      })
                    }
                    style={smallInput}
                  />

                  <button
                    onClick={() => addProgress(g.id)}
                    style={btnSecondary}
                  >
                    Add
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const page = {
  padding: "28px",
  background: "#f4f7fb",
  minHeight: "100vh",
  fontFamily: "Inter, system-ui, sans-serif",
  color: "#1f2937",
};

const header = {
  marginBottom: "22px",
};

const title = {
  margin: 0,
  fontSize: "30px",
  fontWeight: "700",
};

const subtitle = {
  color: "#6b7280",
  marginTop: "6px",
  fontSize: "14px",
};

const formBox = {
  background: "white",
  padding: "18px",
  borderRadius: "14px",
  marginBottom: "22px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
};

const sectionTitle = {
  marginBottom: "14px",
  fontSize: "16px",
  fontWeight: "600",
};

const form = {
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
};

const input = {
  flex: 1,
  minWidth: "200px",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
};

const smallInput = {
  padding: "10px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  width: "140px",
};

const btnPrimary = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: "10px",
  fontWeight: "600",
  cursor: "pointer",
};

const btnSecondary = {
  background: "#22c55e",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: "10px",
  cursor: "pointer",
};

const deleteBtn = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "15px",
};

const card = {
  background: "white",
  padding: "18px",
  borderRadius: "14px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const info = {
  marginTop: "10px",
  fontSize: "14px",
  color: "#4b5563",
  lineHeight: "1.6",
};

const bar = {
  height: "8px",
  background: "#e5e7eb",
  borderRadius: "999px",
  marginTop: "12px",
  overflow: "hidden",
};

const fill = {
  height: "100%",
  background: "#2563eb",
};

const percentText = {
  fontSize: "12px",
  color: "#6b7280",
  marginTop: "6px",
};

const progressBox = {
  display: "flex",
  gap: "10px",
  marginTop: "12px",
};

const emptyBox = {
  padding: "20px",
  background: "white",
  borderRadius: "14px",
  color: "#6b7280",
  textAlign: "center",
};