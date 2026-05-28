import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Goals() {
  const [goals, setGoals] = useState([]);

  const [form, setForm] = useState({
    name: "",
    target_amount: "",
    target_date: "",
  });

  const [progress, setProgress] = useState({});

  // FETCH
  const fetchGoals = async () => {
    try {
      const res = await api.get("/goals/");
      setGoals(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  // CREATE
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

  // DELETE
  const deleteGoal = async (id) => {
    await api.delete(`/goals/${id}`);
    fetchGoals();
  };

  // ADD PROGRESS
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
        <p style={subtitle}>Track your savings targets and progress</p>
      </div>

      {/* CREATE FORM */}
      <form onSubmit={createGoal} style={formStyle}>
        <input
          placeholder="Goal Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          style={input}
        />

        <input
          type="number"
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

        <button type="submit" style={btnPrimary}>
          Create Goal
        </button>
      </form>

      {/* GOALS GRID */}
      <div style={grid}>
        {goals.length === 0 ? (
          <p>No goals yet</p>
        ) : (
          goals.map((g) => {
            const percent =
              g.target_amount > 0
                ? (g.saved_amount / g.target_amount) * 100
                : 0;

            return (
              <div key={g.id} style={card}>
                <div style={cardHeader}>
                  <h3 style={{ margin: 0 }}>{g.name}</h3>

                  <button
                    onClick={() => deleteGoal(g.id)}
                    style={deleteBtn}
                  >
                    Delete
                  </button>
                </div>

                <div style={stats}>
                  <p>🎯 Target: Rs {g.target_amount}</p>
                  <p>💰 Saved: Rs {g.saved_amount}</p>
                  <p>📉 Remaining: Rs {g.target_amount - g.saved_amount}</p>
                  <p>⚡ Monthly Need: Rs {g.monthly_saving_needed}</p>
                </div>

                {/* PROGRESS BAR */}
                <div style={progressBar}>
                  <div
                    style={{
                      ...progressFill,
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
                    type="number"
                    placeholder="Add savings"
                    value={progress[g.id] || ""}
                    onChange={(e) =>
                      setProgress({
                        ...progress,
                        [g.id]: e.target.value,
                      })
                    }
                    style={inputSmall}
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

/* ================= STYLES ================= */

const page = {
  padding: "20px",
  background: "#f4f7fb",
  minHeight: "100vh",
};

const header = {
  marginBottom: "20px",
};

const title = {
  fontSize: "30px",
  margin: 0,
};

const subtitle = {
  color: "gray",
};

const formStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginBottom: "25px",
};

const input = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  flex: "1",
  minWidth: "200px",
};

const inputSmall = {
  padding: "8px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  width: "120px",
};

const btnPrimary = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const btnSecondary = {
  background: "#22c55e",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
};

const deleteBtn = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "15px",
};

const card = {
  background: "white",
  padding: "15px",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const stats = {
  marginTop: "10px",
  color: "#444",
  fontSize: "14px",
  lineHeight: "1.6",
};

const progressBar = {
  width: "100%",
  height: "8px",
  background: "#e5e7eb",
  borderRadius: "999px",
  marginTop: "10px",
};

const progressFill = {
  height: "100%",
  background: "#2563eb",
  borderRadius: "999px",
};

const percentText = {
  fontSize: "12px",
  color: "gray",
  marginTop: "5px",
};

const progressBox = {
  display: "flex",
  gap: "8px",
  marginTop: "10px",
};