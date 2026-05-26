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

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <Navbar />

      <h1>🧠 Financial Intelligence Dashboard</h1>

      {/* ================= FINANCE ENGINE ================= */}
      <section style={sectionStyle}>
        <h2>📊 Finance Overview</h2>

        <div style={grid}>
          <Card title="Total Budget" value={finance.summary.total_budget} />
          <Card title="Spent" value={finance.summary.total_spent} />
          <Card title="Remaining" value={finance.summary.remaining_budget} />
          <Card title="Status" value={finance.summary.status} />
        </div>

        <h3>🎯 Goals Breakdown</h3>
        {finance.goal_breakdown.map((g, i) => (
          <div key={i} style={cardStyle}>
            <b>{g.goal}</b>
            <p>Remaining: {g.remaining_amount}</p>
            <p>Months Left: {g.months_left}</p>
            <p>Monthly Required: {g.monthly_required}</p>
          </div>
        ))}
      </section>

      {/* ================= INSIGHTS ================= */}
      <section style={sectionStyle}>
        <h2>🤖 AI Insights</h2>

        <div style={cardStyle}>
          <p><b>Risk Level:</b> {insights.risk_level}</p>
          <p><b>Highest Category:</b> {insights.summary.highest_spending_category}</p>
          <p><b>Savings Potential:</b> {insights.summary.savings_potential}</p>
        </div>

        <h3>Alerts</h3>
        {insights.alerts.length ? (
          insights.alerts.map((a, i) => <p key={i}>⚠️ {a}</p>)
        ) : (
          <p>No alerts 🎉</p>
        )}
      </section>

      {/* ================= SAVINGS ================= */}
      <section style={sectionStyle}>
        <h2>💰 Savings Recommendations</h2>

        <div style={cardStyle}>
          <p><b>Daily Safe Spend:</b> {savings.summary.daily_safe_spend}</p>
          <p><b>Daily Average:</b> {savings.summary.daily_average}</p>
          <p><b>Trend:</b> {savings.summary.spending_trend}</p>
        </div>

        <h3>Recommendations</h3>
        {savings.recommendations.map((r, i) => (
          <p key={i}>💡 {r}</p>
        ))}
      </section>

      {/* ================= PREDICTIONS ================= */}
      <section style={sectionStyle}>
        <h2>📈 7-Day Forecast</h2>

        <div style={grid}>
          {predictions["7_day_forecast"].map((p, i) => (
            <div key={i} style={cardStyle}>
              <p><b>{p.date}</b></p>
              <p>{p.predicted_spending}</p>
            </div>
          ))}
        </div>

        <h3>Total Forecast</h3>
        <p>{predictions.total_predicted_spending}</p>
      </section>
    </div>
  );
}

/* ================= UI COMPONENT ================= */
function Card({ title, value }) {
  return (
    <div style={cardStyle}>
      <h4>{title}</h4>
      <p style={{ fontSize: "18px", fontWeight: "bold" }}>{value}</p>
    </div>
  );
}

/* ================= STYLES ================= */
const sectionStyle = {
  marginTop: "30px",
  padding: "15px",
  borderRadius: "10px",
  background: "#f5f5f5",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "10px",
};

const cardStyle = {
  padding: "10px",
  background: "white",
  borderRadius: "8px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
};