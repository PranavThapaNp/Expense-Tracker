import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [categorySummary, setCategorySummary] = useState({});
  const [loading, setLoading] = useState(true);

  // form state
  const [form, setForm] = useState({
    amount: "",
    category: "",
    description: "",
  });

  // edit state
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchExpenses(), fetchTotal(), fetchCategories()]);
    setLoading(false);
  };

  // ---------------- FETCH ----------------
  const fetchExpenses = async () => {
    const res = await api.get("/expenses/");
    setExpenses(res.data);
  };

  const fetchTotal = async () => {
    const res = await api.get("/expenses/summary/total");
    setTotal(res.data.total_spent);
  };

  const fetchCategories = async () => {
    const res = await api.get("/expenses/summary/categories");
    setCategorySummary(res.data);
  };

  // ---------------- CREATE ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editId) {
      await api.put(`/expenses/${editId}`, form);
      setEditId(null);
    } else {
      await api.post("/expenses/", form);
    }

    setForm({ amount: "", category: "", description: "" });
    loadAll();
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    await api.delete(`/expenses/${id}`);
    loadAll();
  };

  // ---------------- EDIT ----------------
  const handleEdit = (expense) => {
    setForm({
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
    });
    setEditId(expense.id);
  };

  return (
    <div>
      <Navbar />

      <h1>Expenses</h1>

      {/* SUMMARY */}
      <div>
        <h3>Total Spent: {total}</h3>

        <h4>Category Breakdown</h4>
        <ul>
          {Object.entries(categorySummary).map(([cat, amt]) => (
            <li key={cat}>
              {cat}: {amt}
            </li>
          ))}
        </ul>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Amount"
          value={form.amount}
          onChange={(e) =>
            setForm({ ...form, amount: e.target.value })
          }
        />

        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value })
          }
        />

        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <button type="submit">
          {editId ? "Update Expense" : "Add Expense"}
        </button>
      </form>

      {/* LIST */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {expenses.map((e) => (
            <li key={e.id}>
              {e.amount} - {e.category} - {e.description}

              <button onClick={() => handleEdit(e)}>Edit</button>
              <button onClick={() => handleDelete(e.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}