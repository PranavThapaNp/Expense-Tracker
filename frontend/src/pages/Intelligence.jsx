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

      {/* HEADER */}
      <div style={header}>
        <h1 style={title}>🧠 Financial Intelligence</h1>
        <p style={subtitle}>AI-powered insights for your financial health</p>
      </div>

      {/* TOP CARDS */}
      <section style={topGrid}>
        <Card title="Total Budget" value={finance?.summary?.total_budget} />
        <Card title="Total Spent" value={finance?.summary?.total_spent} />
        <Card title="Remaining" value={finance?.summary?.remaining_budget} />
        <Card title="Status" value={finance?.summary?.status} highlight />
      </section>

      {/* MAIN GRID */}
      <div style={mainGrid}>
        {/* LEFT */}
        <div style={leftCol}>
          {/* GOALS */}
          <section style={cardSection}>
            <h2 style={sectionTitle}>📊 Goals Breakdown</h2>

            <div style={grid2}>
              {(finance?.goal_breakdown || []).map((g, i) => (
                <div key={i} style={miniCard}>
                  <h3 style={miniTitle}>{g.goal}</h3>
                  <p>Remaining: Rs {g.remaining_amount}</p>
                  <p>Months: {g.months_left}</p>
                  <p>Monthly: Rs {g.monthly_required}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FORECAST */}
          <section style={cardSection}>
            <h2 style={sectionTitle}>📈 7-Day Forecast</h2>

            <p style={forecastDesc}>
              This shows your predicted daily spending for the next 7 days based on your
              past expense patterns and AI analysis.
            </p>

            <div style={grid}>
              {(predictions?.["7_day_forecast"] || []).map((p, i) => (
                <div key={i} style={miniCard}>
                  <h3 style={miniTitle}>{p.date}</h3>
                  <p>Rs {p.predicted_spending}</p>
                </div>
              ))}
            </div>

            <p style={footerText}>
              Total Forecast: <b>Rs {predictions?.total_predicted_spending}</b>
            </p>
          </section>
        </div>

        {/* RIGHT */}
        <div style={rightCol}>
          {/* INSIGHTS */}
          <section style={cardSection}>
            <h2 style={sectionTitle}>🤖 AI Insights</h2>

            <div style={miniCard}>
              <p><b>Risk:</b> {insights?.risk_level}</p>
              <p><b>Top Category:</b> {insights?.summary?.highest_spending_category}</p>
              <p><b>Savings Potential:</b> Rs {insights?.summary?.savings_potential}</p>
            </div>
          </section>

          {/* ALERTS */}
          <section style={cardSection}>
            <h2 style={sectionTitle}>🚨 Alerts</h2>

            {(insights?.alerts || []).length === 0 ? (
              <div style={successBox}>🎉 No alerts</div>
            ) : (
              insights.alerts.map((a, i) => (
                <div key={i} style={alertBox}>⚠️ {a}</div>
              ))
            )}
          </section>

          {/* SAVINGS */}
          <section style={cardSection}>
            <h2 style={sectionTitle}>💰 Savings</h2>

            <div style={miniCard}>
              <p><b>Safe Spend:</b> {savings?.summary?.daily_safe_spend}</p>
              <p><b>Average:</b> {savings?.summary?.daily_average}</p>
              <p><b>Trend:</b> {savings?.summary?.spending_trend}</p>
            </div>

            <div style={{ marginTop: 12 }}>
              {(savings?.recommendations || []).map((r, i) => (
                <div key={i} style={recommendationBox}>💡 {r}</div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

function Card({ title, value, highlight }) {
  return (
    <div style={{ ...topCard, borderLeft: highlight ? "4px solid #4f46e5" : "" }}>
      <p style={muted}>{title}</p>
      <h2 style={{ margin: 0 }}>{value}</h2>
    </div>
  );
}

/* ================= STYLES ================= */

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

const topGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "16px",
  marginBottom: "22px",
};

const mainGrid = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr",
  gap: "18px",
};

const leftCol = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const rightCol = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const cardSection = {
  background: "white",
  padding: "18px",
  borderRadius: "14px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
};

const sectionTitle = {
  marginBottom: "14px",
  fontSize: "16px",
  fontWeight: "600",
};

const topCard = {
  background: "white",
  padding: "18px",
  borderRadius: "14px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
};

const miniCard = {
  background: "#f9fafc",
  padding: "14px",
  borderRadius: "12px",
  fontSize: "14px",
  lineHeight: "1.6",
};

const miniTitle = {
  marginBottom: "6px",
  fontSize: "15px",
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

const alertBox = {
  background: "#ffe5e5",
  padding: "10px",
  borderRadius: "10px",
  marginBottom: "8px",
};

const successBox = {
  background: "#e7f8ec",
  padding: "10px",
  borderRadius: "10px",
};

const recommendationBox = {
  background: "#fff8e6",
  padding: "10px",
  borderRadius: "10px",
  marginBottom: "8px",
};

const footerText = {
  marginTop: "14px",
  fontSize: "14px",
};

const muted = {
  color: "#6b7280",
  fontSize: "13px",
};

const loadingStyle = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "16px",
};

const forecastDesc = {
  marginTop: "-6px",
  marginBottom: "14px",
  fontSize: "13px",
  color: "#6b7280",
  lineHeight: "1.5",
};