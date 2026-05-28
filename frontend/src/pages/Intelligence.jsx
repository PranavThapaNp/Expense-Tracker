import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Intelligence() {
  const [finance, setFinance] = useState(null);
  const [insights, setInsights] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [savings, setSavings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [f, i, p, s] = await Promise.all([
        api.get("/finance/plan"),
        api.get("/insights/"),
        api.get("/ml/forecast"),
        api.get("/savings/"),
      ]);

      setFinance(f.data);
      setInsights(i.data);
      setPredictions(p.data);
      setSavings(s.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={loadingStyle}>
        <p>Loading financial intelligence...</p>
      </div>
    );
  }

  return (
    <div style={page}>
      <Navbar />

      <h1 style={title}>🧠 Financial Intelligence</h1>

      {/* ================= TOP CARDS ================= */}
      <section style={grid}>
        <Card title="Total Budget" value={finance?.summary?.total_budget} />
        <Card title="Total Spent" value={finance?.summary?.total_spent} />
        <Card title="Remaining" value={finance?.summary?.remaining_budget} />
        <Card title="Status" value={finance?.summary?.status} highlight />
      </section>

      {/* ================= FINANCE BREAKDOWN ================= */}
      <section style={section}>
        <h2 style={sectionTitle}>📊 Goals Breakdown</h2>

        <div style={grid2}>
          {(finance?.goal_breakdown || []).map((g, i) => (
            <div key={i} style={card}>
              <h3 style={{ marginBottom: 6 }}>{g.goal}</h3>
              <p>Remaining: ₹{g.remaining_amount}</p>
              <p>Months Left: {g.months_left}</p>
              <p>Monthly Required: ₹{g.monthly_required}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= INSIGHTS ================= */}
      <section style={section}>
        <h2 style={sectionTitle}>🤖 AI Insights</h2>

        <div style={card}>
          <p>
            <b>Risk Level:</b> {insights?.risk_level}
          </p>
          <p>
            <b>Highest Category:</b>{" "}
            {insights?.summary?.highest_spending_category}
          </p>
          <p>
            <b>Savings Potential:</b> ₹
            {insights?.summary?.savings_potential}
          </p>
        </div>

        <div style={listBox}>
          <h4>Alerts</h4>
          {(insights?.alerts || []).length === 0 ? (
            <p>🎉 No alerts</p>
          ) : (
            insights.alerts.map((a, i) => <p key={i}>⚠️ {a}</p>)
          )}
        </div>
      </section>

      {/* ================= SAVINGS ================= */}
      <section style={section}>
        <h2 style={sectionTitle}>💰 Savings Insights</h2>

        <div style={grid}>
          <Card
            title="Daily Safe Spend"
            value={savings?.summary?.daily_safe_spend}
          />
          <Card
            title="Daily Average"
            value={savings?.summary?.daily_average}
          />
          <Card title="Trend" value={savings?.summary?.spending_trend} />
        </div>

        <div style={listBox}>
          <h4>Recommendations</h4>
          {(savings?.recommendations || []).map((r, i) => (
            <p key={i}>💡 {r}</p>
          ))}
        </div>
      </section>

      {/* ================= PREDICTIONS ================= */}
      <section style={section}>
        <h2 style={sectionTitle}>📈 7-Day Forecast</h2>

        <div style={grid2}>
          {(predictions?.["7_day_forecast"] || []).map((p, i) => (
            <div key={i} style={card}>
              <b>{p.date}</b>
              <p>₹{p.predicted_spending}</p>
            </div>
          ))}
        </div>

        <p style={footerText}>
          Total Forecast: <b>₹{predictions?.total_predicted_spending}</b>
        </p>
      </section>
    </div>
  );
}

/* ================= COMPONENT ================= */
function Card({ title, value, highlight }) {
  return (
    <div style={{ ...card, borderLeft: highlight ? "4px solid #4f46e5" : "" }}>
      <h4 style={{ marginBottom: 5 }}>{title}</h4>
      <p style={{ fontSize: 18, fontWeight: "bold" }}>{value}</p>
    </div>
  );
}

/* ================= STYLES ================= */
const page = {
  padding: "20px",
  background: "#f6f7fb",
  minHeight: "100vh",
};

const title = {
  marginBottom: "20px",
};

const section = {
  marginTop: "25px",
};

const sectionTitle = {
  marginBottom: "10px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
};

const grid2 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px",
};

const card = {
  background: "white",
  padding: "15px",
  borderRadius: "12px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
};

const listBox = {
  marginTop: "15px",
  padding: "15px",
  background: "white",
  borderRadius: "12px",
};

const footerText = {
  marginTop: "15px",
  fontSize: "16px",
};

const loadingStyle = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "18px",
};