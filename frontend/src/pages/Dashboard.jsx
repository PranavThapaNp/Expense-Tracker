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

  if (!data) return <p>Loading...</p>;

  const { analytics, budget_summary, ai_insights, goals, alerts, recent_expenses } = data;

  return (
    <div style={{ padding: "20px" }}>
      <Navbar />

      <h1>📊 Dashboard</h1>

      {/* ================= ANALYTICS ================= */}
      <section>
        <h2>Analytics</h2>
        <p><b>Total Spent:</b> {analytics.total_spent}</p>
        <p><b>Avg Daily Spending:</b> {analytics.average_daily_spending}</p>
        <p><b>Highest Category:</b> {analytics.highest_spending_category}</p>

        <h4>Category Breakdown</h4>
        <ul>
          {Object.entries(analytics.category_breakdown || {}).map(
            ([cat, val]) => (
              <li key={cat}>
                {cat}: {val}
              </li>
            )
          )}
        </ul>
      </section>

      <hr />

      {/* ================= BUDGET ================= */}
      <section>
        <h2>💰 Budget Summary</h2>
        <p><b>Total Budget:</b> {budget_summary.total_budget}</p>
        <p><b>Total Remaining:</b> {budget_summary.total_remaining}</p>
        <p><b>Usage:</b> {budget_summary.overall_percent_used}%</p>
        <p><b>Status:</b> {budget_summary.overall_status}</p>
      </section>

      <hr />

      {/* ================= ALERTS ================= */}
      <section>
        <h2>🚨 Alerts</h2>
        {alerts.length === 0 ? (
          <p>No alerts 🎉</p>
        ) : (
          <ul>
            {alerts.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        )}
      </section>

      <hr />

      {/* ================= AI INSIGHTS ================= */}
      <section>
        <h2>🤖 AI Insights</h2>

        <p><b>Risk Level:</b> {ai_insights.risk_level}</p>
        <p><b>Efficiency Score:</b> {ai_insights.budget_efficiency_score}%</p>
        <p><b>Trend:</b> {ai_insights.monthly_spending_trend}</p>
        <p><b>Top Waste Category:</b> {ai_insights.top_waste_category}</p>

        <h4>Overspending Categories</h4>
        {ai_insights.overspending_categories.length === 0 ? (
          <p>None</p>
        ) : (
          <ul>
            {ai_insights.overspending_categories.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        )}

        <h4>Saving Opportunities</h4>
        {ai_insights.saving_opportunities.length === 0 ? (
          <p>None</p>
        ) : (
          <ul>
            {ai_insights.saving_opportunities.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        )}
      </section>

      <hr />

      {/* ================= GOALS ================= */}
      <section>
        <h2>🎯 Goals</h2>
        <p><b>Active Goals:</b> {goals.active_goals}</p>
        <p><b>Monthly Saving Needed:</b> {goals.monthly_saving_required_total}</p>

        <ul>
          {goals.goal_names.map((g, i) => (
            <li key={i}>{g}</li>
          ))}
        </ul>
      </section>

      <hr />

      {/* ================= RECENT EXPENSES ================= */}
      <section>
        <h2>🧾 Recent Expenses</h2>

        {recent_expenses.length === 0 ? (
          <p>No expenses</p>
        ) : (
          <ul>
            {recent_expenses.map((e) => (
              <li key={e.id}>
                {e.amount} - {e.category} - {e.description}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}