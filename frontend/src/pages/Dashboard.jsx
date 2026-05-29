import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/dashboard/");
      setData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!data) return <p style={{ padding: 24 }}>Loading...</p>;

  const {
    analytics,
    budget_summary,
    ai_insights,
    goals,
    alerts,
    recent_expenses,
  } = data;

  return (
    <div style={page}>
      <Navbar />

      {/* HEADER */}
      <div style={header}>
        <h1 style={mainTitle}>📊 Financial Dashboard</h1>
        <p style={subtitle}>Overview of your financial health and insights</p>
      </div>

      {/* TOP CARDS */}
      <div style={topGrid}>
        <Card title="Total Spent" value={`Rs ${analytics.total_spent}`} />
        <Card title="Remaining" value={`Rs ${budget_summary.total_remaining}`} />
        <Card title="Usage" value={`${budget_summary.overall_percent_used}%`} />
        <Card title="Risk" value={ai_insights.risk_level} />
      </div>

      {/* MAIN GRID */}
      <div style={mainGrid}>
        {/* LEFT */}
        <div style={leftCol}>
          {/* ANALYTICS */}
          <section style={cardSection}>
            <h2 style={sectionTitle}>📈 Analytics</h2>

            <div style={miniGrid}>
              <InfoCard label="Avg Daily" value={`Rs ${analytics.average_daily_spending}`} />
              <InfoCard label="Top Category" value={analytics.highest_spending_category || "N/A"} />
              <InfoCard label="Status" value={budget_summary.overall_status} />
              <InfoCard label="Efficiency" value={`${ai_insights.budget_efficiency_score}%`} />
            </div>

            <h3 style={smallTitle}>Category Breakdown</h3>

            <div style={chipGrid}>
              {Object.entries(analytics.category_breakdown || {}).map(([cat, val]) => (
                <div key={cat} style={chip}>
                  {cat}: Rs {val}
                </div>
              ))}
            </div>
          </section>

          {/* RECENT EXPENSES */}
          <section style={cardSection}>
            <h2 style={sectionTitle}>🧾 Recent Expenses</h2>

            <div style={expenseList}>
              {recent_expenses.map((e) => (
                <div key={e.id} style={expenseRow}>
                  <div>
                    <div style={expenseTitle}>{e.category}</div>
                    <div style={muted}>{e.description}</div>
                  </div>
                  <div style={expenseAmount}>Rs {e.amount}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <div style={rightCol}>
          {/* ALERTS */}
          <section style={cardSection}>
            <h2 style={sectionTitle}>🚨 Alerts</h2>

            {alerts.length === 0 ? (
              <div style={successBox}>All good 🎉 No alerts</div>
            ) : (
              alerts.map((a, i) => (
                <div key={i} style={alertBox}>{a}</div>
              ))
            )}
          </section>

          {/* INSIGHTS */}
          <section style={cardSection}>
            <h2 style={sectionTitle}>🤖 Insights</h2>

            <div style={miniGrid}>
              <InfoCard label="Trend" value={ai_insights.monthly_spending_trend} />
              <InfoCard label="Waste" value={ai_insights.top_waste_category || "N/A"} />
            </div>
          </section>

          {/* GOALS */}
          <section style={cardSection}>
            <h2 style={sectionTitle}>🎯 Goals</h2>

            <InfoCard label="Active" value={goals.active_goals} />
            <InfoCard
              label="Saving Needed"
              value={`Rs ${goals.monthly_saving_required_total}`}
            />

            <div style={chipGrid}>
              {goals.goal_names.map((g, i) => (
                <div key={i} style={chip}>🎯 {g}</div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Card({ title, value }) {
  return (
    <div style={topCard}>
      <p style={muted}>{title}</p>
      <h2 style={cardValue}>{value}</h2>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div style={infoCard}>
      <p style={muted}>{label}</p>
      <div style={infoValue}>{value}</div>
    </div>
  );
}

/* ================= STYLES ================= */

const page = {
  padding: "32px",
  background: "#f4f7fb",
  minHeight: "100vh",
  fontFamily: "Inter, system-ui, sans-serif",
  color: "#1f2937",
};

const header = {
  marginBottom: "28px",
};

const mainTitle = {
  margin: 0,
  fontSize: "32px",
  fontWeight: 700,
  letterSpacing: "-0.5px",
};

const subtitle = {
  color: "#6b7280",
  marginTop: "8px",
  fontSize: "15px",
};

const topGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "18px",
  marginBottom: "28px",
};

const mainGrid = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr",
  gap: "22px",
};

const leftCol = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const rightCol = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const cardSection = {
  background: "white",
  padding: "22px",
  borderRadius: "14px",
};

const sectionTitle = {
  marginBottom: "16px",
  fontSize: "18px",
  fontWeight: 600,
};

const smallTitle = {
  marginTop: "18px",
  marginBottom: "10px",
  fontSize: "14px",
  fontWeight: 600,
};

const topCard = {
  background: "white",
  padding: "20px",
  borderRadius: "14px",
  boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
};

const cardValue = {
  margin: "8px 0 0 0",
  fontSize: "22px",
};

const infoCard = {
  background: "#f9fafc",
  padding: "14px",
  borderRadius: "12px",
};

const infoValue = {
  marginTop: "6px",
  fontWeight: 600,
};

const miniGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "14px",
};

const chipGrid = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginTop: "12px",
};

const chip = {
  background: "#eef2ff",
  padding: "8px 12px",
  borderRadius: "20px",
  fontSize: "12px",
};

const expenseList = {
  marginTop: "10px",
};

const expenseRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "14px 0",
  borderBottom: "1px solid #f1f1f1",
};

const expenseTitle = {
  fontWeight: 600,
};

const expenseAmount = {
  fontWeight: 600,
};

const alertBox = {
  background: "#ffe5e5",
  padding: "12px",
  borderRadius: "10px",
  marginBottom: "10px",
};

const successBox = {
  background: "#e7f8ec",
  padding: "12px",
  borderRadius: "10px",
};

const muted = {
  color: "#6b7280",
  fontSize: "12px",
  margin: "4px 0 0 0",
};