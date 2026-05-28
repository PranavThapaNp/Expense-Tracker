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

  if (!data) return <p style={{ padding: "20px" }}>Loading...</p>;

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

      {/* ================= HEADER ================= */}
      <div style={header}>
        <div>
          <h1 style={mainTitle}>📊 Financial Dashboard</h1>
          <p style={subtitle}>
            Monitor your expenses, savings, and financial health
          </p>
        </div>
      </div>

      {/* ================= TOP CARDS ================= */}
      <div style={grid}>
        <Card
          title="Total Spent"
          value={`Rs ${analytics.total_spent}`}
        />

        <Card
          title="Remaining Budget"
          value={`Rs ${budget_summary.total_remaining}`}
        />

        <Card
          title="Budget Usage"
          value={`${budget_summary.overall_percent_used}%`}
        />

        <Card
          title="Risk Level"
          value={ai_insights.risk_level}
        />
      </div>

      {/* ================= ANALYTICS ================= */}
      <section style={section}>
        <h2 style={sectionTitle}>📈 Analytics</h2>

        <div style={grid}>
          <InfoCard
            label="Average Daily Spending"
            value={`Rs ${analytics.average_daily_spending}`}
          />

          <InfoCard
            label="Highest Spending Category"
            value={analytics.highest_spending_category || "N/A"}
          />

          <InfoCard
            label="Budget Status"
            value={budget_summary.overall_status}
          />

          <InfoCard
            label="Efficiency Score"
            value={`${ai_insights.budget_efficiency_score}%`}
          />
        </div>

        <h3 style={smallTitle}>Category Breakdown</h3>

        <div style={categoryContainer}>
          {Object.entries(analytics.category_breakdown || {}).map(
            ([cat, val]) => (
              <div key={cat} style={categoryCard}>
                <p style={categoryName}>{cat}</p>
                <h3>Rs {val}</h3>
              </div>
            )
          )}
        </div>
      </section>

      {/* ================= ALERTS ================= */}
      <section style={section}>
        <h2 style={sectionTitle}>🚨 Alerts</h2>

        {alerts.length === 0 ? (
          <div style={successBox}>
            No alerts. Everything looks good 🎉
          </div>
        ) : (
          alerts.map((a, i) => (
            <div key={i} style={alertBox}>
              ⚠️ {a}
            </div>
          ))
        )}
      </section>

      {/* ================= AI INSIGHTS ================= */}
      <section style={section}>
        <h2 style={sectionTitle}>🤖 AI Insights</h2>

        <div style={grid}>
          <InfoCard
            label="Monthly Trend"
            value={ai_insights.monthly_spending_trend}
          />

          <InfoCard
            label="Top Waste Category"
            value={ai_insights.top_waste_category || "N/A"}
          />
        </div>

        <div style={{ marginTop: "20px" }}>
          <h3 style={smallTitle}>Saving Opportunities</h3>

          {ai_insights.saving_opportunities.length === 0 ? (
            <p>No recommendations</p>
          ) : (
            ai_insights.saving_opportunities.map((s, i) => (
              <div key={i} style={recommendationBox}>
                💡 {s}
              </div>
            ))
          )}
        </div>
      </section>

      {/* ================= GOALS ================= */}
      <section style={section}>
        <h2 style={sectionTitle}>🎯 Goals</h2>

        <div style={grid}>
          <InfoCard
            label="Active Goals"
            value={goals.active_goals}
          />

          <InfoCard
            label="Monthly Saving Needed"
            value={`Rs ${goals.monthly_saving_required_total}`}
          />
        </div>

        <div style={{ marginTop: "20px" }}>
          {goals.goal_names.map((g, i) => (
            <div key={i} style={goalCard}>
              🎯 {g}
            </div>
          ))}
        </div>
      </section>

      {/* ================= RECENT EXPENSES ================= */}
      <section style={section}>
        <h2 style={sectionTitle}>🧾 Recent Expenses</h2>

        {recent_expenses.length === 0 ? (
          <p>No recent expenses</p>
        ) : (
          <div style={expenseContainer}>
            {recent_expenses.map((e) => (
              <div key={e.id} style={expenseCard}>
                <div>
                  <h3 style={{ margin: 0 }}>{e.category}</h3>
                  <p style={{ color: "gray", margin: "5px 0" }}>
                    {e.description}
                  </p>
                </div>

                <h3>Rs {e.amount}</h3>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Card({ title, value }) {
  return (
    <div style={topCard}>
      <p style={cardLabel}>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div style={infoCard}>
      <p style={cardLabel}>{label}</p>
      <h3>{value}</h3>
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
  marginBottom: "30px",
};

const mainTitle = {
  margin: 0,
  fontSize: "32px",
};

const subtitle = {
  color: "gray",
  marginTop: "8px",
};

const section = {
  background: "white",
  padding: "20px",
  borderRadius: "15px",
  marginBottom: "25px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};

const sectionTitle = {
  marginBottom: "20px",
};

const smallTitle = {
  marginTop: "25px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "15px",
};

const topCard = {
  background: "white",
  padding: "20px",
  borderRadius: "15px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};

const infoCard = {
  background: "#f9fafc",
  padding: "15px",
  borderRadius: "12px",
};

const cardLabel = {
  color: "gray",
  marginBottom: "10px",
};

const categoryContainer = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginTop: "15px",
};

const categoryCard = {
  background: "#eef2ff",
  padding: "15px",
  borderRadius: "10px",
  minWidth: "120px",
};

const categoryName = {
  color: "#444",
};

const alertBox = {
  background: "#ffe5e5",
  color: "#b00020",
  padding: "12px",
  borderRadius: "10px",
  marginBottom: "10px",
};

const successBox = {
  background: "#e7f8ec",
  color: "#1b7f3b",
  padding: "12px",
  borderRadius: "10px",
};

const recommendationBox = {
  background: "#fff8e6",
  padding: "12px",
  borderRadius: "10px",
  marginBottom: "10px",
};

const goalCard = {
  background: "#edf4ff",
  padding: "12px",
  borderRadius: "10px",
  marginBottom: "10px",
};

const expenseContainer = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const expenseCard = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#f9fafc",
  padding: "15px",
  borderRadius: "10px",
};