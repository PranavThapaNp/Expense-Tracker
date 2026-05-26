import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Budget() {
  const [data, setData] = useState(null);

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

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <Navbar />

      <h1>Budget</h1>

      {/* SUMMARY SECTION */}
      <div>
        <h3>Summary</h3>
        <p>Total Budget: {data.summary.total_budget}</p>
        <p>Total Spent: {data.summary.total_spent}</p>
        <p>Total Remaining: {data.summary.total_remaining}</p>
        <p>
          Overall Used: {data.summary.overall_percent_used}%
        </p>
        <p>Status: {data.summary.overall_status}</p>
      </div>

      <hr />

      {/* CATEGORY BUDGETS */}
      <h3>Categories</h3>

      {data.budgets.map((b, i) => (
        <div key={i} style={{ marginBottom: "10px" }}>
          <p><b>{b.category}</b></p>
          <p>Limit: {b.budget_limit}</p>
          <p>Spent: {b.spent}</p>
          <p>Remaining: {b.remaining}</p>
          <p>{b.percent_used}% used</p>
          <p>Status: {b.status}</p>
        </div>
      ))}
    </div>
  );
}