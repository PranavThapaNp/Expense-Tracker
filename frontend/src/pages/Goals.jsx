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

  const [progress, setProgress] = useState({}); // {id: value}

  // ---------------- FETCH GOALS ----------------
  const fetchGoals = async () => {
    try {
      const res = await api.get("/goals/");
      setGoals(res.data);
    } catch (err) {
      console.log(err.response?.data || err);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  // ---------------- CREATE GOAL ----------------
  const createGoal = async (e) => {
    e.preventDefault();

    try {
      await api.post("/goals/", {
        name: form.name,
        target_amount: Number(form.target_amount),
        target_date: form.target_date,
      });

      setForm({ name: "", target_amount: "", target_date: "" });
      fetchGoals();
    } catch (err) {
      console.log(err.response?.data || err);
    }
  };

  // ---------------- DELETE GOAL ----------------
  const deleteGoal = async (id) => {
    try {
      await api.delete(`/goals/${id}`);
      fetchGoals();
    } catch (err) {
      console.log(err.response?.data || err);
    }
  };

  // ---------------- ADD PROGRESS ----------------
  const addProgress = async (id) => {
    try {
      const res = await api.put(`/goals/${id}/progress`, {
        saved_amount: Number(progress[id] || 0),
      });

      console.log("Progress updated:", res.data);

      setProgress({ ...progress, [id]: "" });
      fetchGoals();
    } catch (err) {
      console.log(err.response?.data || err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Navbar />

      <h1>🎯 Goals</h1>

      {/* ---------------- CREATE FORM ---------------- */}
      <form onSubmit={createGoal} style={{ marginBottom: "20px" }}>
        <input
          placeholder="Goal Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Target Amount"
          type="number"
          value={form.target_amount}
          onChange={(e) =>
            setForm({ ...form, target_amount: e.target.value })
          }
        />

        <input
          type="date"
          value={form.target_date}
          onChange={(e) =>
            setForm({ ...form, target_date: e.target.value })
          }
        />

        <button type="submit">Create Goal</button>
      </form>

      <hr />

      {/* ---------------- GOALS LIST ---------------- */}
      {goals.length === 0 ? (
        <p>No goals yet</p>
      ) : (
        goals.map((g) => {
          const progressPercent =
            g.target_amount > 0
              ? ((g.saved_amount / g.target_amount) * 100).toFixed(2)
              : 0;

          return (
            <div
              key={g.id}
              style={{
                border: "1px solid #ccc",
                padding: "12px",
                marginBottom: "12px",
                borderRadius: "8px",
              }}
            >
              <h3>{g.name}</h3>

              <p>🎯 Target: {g.target_amount}</p>
              <p>💰 Saved: {g.saved_amount}</p>
              <p>📉 Remaining: {g.target_amount - g.saved_amount}</p>
              <p>📊 Progress: {progressPercent}%</p>
              <p>⚡ Monthly Need: {g.monthly_saving_needed}</p>

              {/* Progress bar */}
              <div
                style={{
                  height: "10px",
                  width: "100%",
                  background: "#eee",
                  borderRadius: "5px",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    height: "10px",
                    width: `${progressPercent}%`,
                    background: "green",
                    borderRadius: "5px",
                  }}
                />
              </div>

              {/* ---------------- ADD PROGRESS ---------------- */}
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
              />

              <button onClick={() => addProgress(g.id)}>
                Add Progress
              </button>

              {/* ---------------- DELETE ---------------- */}
              <button
                onClick={() => deleteGoal(g.id)}
                style={{ marginLeft: "10px", color: "red" }}
              >
                Delete
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}