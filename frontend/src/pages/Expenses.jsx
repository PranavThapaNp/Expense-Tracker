import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [categorySummary, setCategorySummary] = useState({});
  const [loading, setLoading] = useState(true);

  // ================= PAGINATION =================
  const [page, setPage] = useState(1);
  const limit = 5;

  // ================= CATEGORY OPTIONS =================
  const categories = [
    "Food & Drinks",
    "Utility & Bills",
    "Family & Friends",
    "Education",
    "Transportation",
    "Entertainment",
    "Health & Medicine",
    "Others",
  ];

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
  }, [page]);

  const loadAll = async () => {
    setLoading(true);

    await Promise.all([
      fetchExpenses(),
      fetchTotal(),
      fetchCategories(),
    ]);

    setLoading(false);
  };

  // ================= FETCH =================
  const fetchExpenses = async () => {
    try {
      const skip = (page - 1) * limit;

      const res = await api.get(
        `/expenses/?skip=${skip}&limit=${limit}`
      );

      setExpenses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err);
      setExpenses([]);
    }
  };

  const fetchTotal = async () => {
    try {
      const res = await api.get("/expenses/summary/total");
      setTotal(res.data.total_spent || 0);
    } catch (err) {
      setTotal(0);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/expenses/summary/categories");
      setCategorySummary(res.data || {});
    } catch (err) {
      setCategorySummary({});
    }
  };

  // ================= CREATE / UPDATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await api.put(`/expenses/${editId}`, {
          amount: Number(form.amount),
          category: form.category,
          description: form.description,
        });

        setEditId(null);
      } else {
        await api.post("/expenses/", {
          amount: Number(form.amount),
          category: form.category,
          description: form.description,
        });
      }

      setForm({
        amount: "",
        category: "",
        description: "",
      });

      loadAll();
    } catch (err) {
      console.log(err);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      loadAll();
    } catch (err) {
      console.log(err);
    }
  };

  // ================= EDIT =================
  const handleEdit = (expense) => {
    setForm({
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
    });

    setEditId(expense.id);
  };

  return (
    <div style={pageStyle}>
      <Navbar />

      {/* HEADER */}
      <div style={header}>
        <h1 style={title}>💸 Expenses</h1>
        <p style={subtitle}>Track and manage your daily spending</p>
      </div>

      {/* SUMMARY */}
      <div style={summaryGrid}>
        <div style={card}>
          <p style={cardLabel}>Total Spent</p>
          <h2>Rs {total}</h2>
        </div>

        <div style={card}>
          <p style={cardLabel}>Total Categories</p>
          <h2>{Object.keys(categorySummary).length}</h2>
        </div>
      </div>

      {/* CATEGORY */}
      <div style={section}>
        <h2 style={sectionTitle}>📊 Category Breakdown</h2>

        <div style={categoryGrid}>
          {Object.entries(categorySummary || {}).map(([cat, amt]) => (
            <div key={cat} style={categoryCard}>
              <p style={categoryName}>{cat}</p>
              <h3>Rs {amt}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* FORM */}
      <div style={section}>
        <h2 style={sectionTitle}>
          {editId ? "✏️ Update Expense" : "➕ Add Expense"}
        </h2>

        <form onSubmit={handleSubmit} style={formStyle}>
          {/* AMOUNT INPUT */}
          <input
            type="text"
            inputMode="numeric"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) =>
              setForm({
                ...form,
                amount: e.target.value,
              })
            }
            style={input}
          />

          {/* CATEGORY DROPDOWN */}
          <select
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
              })
            }
            style={input}
          >
            <option value="">Select Category</option>

            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* DESCRIPTION */}
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            style={input}
          />

          <button type="submit" style={submitBtn}>
            {editId ? "Update Expense" : "Add Expense"}
          </button>
        </form>
      </div>

      {/* LIST */}
      <div style={section}>
        <h2 style={sectionTitle}>🧾 Expense History</h2>

        {loading ? (
          <p>Loading...</p>
        ) : expenses.length === 0 ? (
          <p>No expenses found</p>
        ) : (
          <>
            <div style={expenseContainer}>
              {expenses.map((e) => (
                <div key={e.id} style={expenseCard}>
                  <div>
                    <h3 style={{ margin: 0 }}>Rs {e.amount}</h3>

                    <p style={expenseCategory}>
                      {e.category}
                    </p>

                    <p style={expenseDescription}>
                      {e.description}
                    </p>
                  </div>

                  <div style={buttonGroup}>
                    <button
                      onClick={() => handleEdit(e)}
                      style={editBtn}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(e.id)}
                      style={deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            <div style={paginationContainer}>
              <button
                style={paginationBtn}
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>

              <span style={pageText}>
                Page {page}
              </span>

              <button
                style={paginationBtn}
                disabled={expenses.length < limit}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const pageStyle = {
  padding: "20px",
  background: "#f4f7fb",
  minHeight: "100vh",
};

const header = {
  marginBottom: "25px",
};

const title = {
  margin: 0,
  fontSize: "32px",
};

const subtitle = {
  color: "gray",
  marginTop: "6px",
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "15px",
  marginBottom: "25px",
};

const card = {
  background: "white",
  padding: "20px",
  borderRadius: "15px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};

const cardLabel = {
  color: "gray",
  marginBottom: "10px",
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

const categoryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "15px",
};

const categoryCard = {
  background: "#eef2ff",
  padding: "15px",
  borderRadius: "12px",
};

const categoryName = {
  color: "#555",
  marginBottom: "8px",
};

const formStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "15px",
};

const input = {
  flex: "1",
  minWidth: "220px",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  outline: "none",
  fontSize: "14px",
  background: "white",
};

const submitBtn = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
};

const expenseContainer = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const expenseCard = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#f9fafc",
  padding: "18px",
  borderRadius: "12px",
};

const expenseCategory = {
  color: "#2563eb",
  fontWeight: "600",
  margin: "5px 0",
};

const expenseDescription = {
  color: "gray",
  margin: 0,
};

const buttonGroup = {
  display: "flex",
  gap: "10px",
};

const editBtn = {
  background: "#facc15",
  color: "black",
  border: "none",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const deleteBtn = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const paginationContainer = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "15px",
  marginTop: "25px",
};

const paginationBtn = {
  padding: "10px 18px",
  border: "none",
  borderRadius: "8px",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};

const pageText = {
  fontWeight: "bold",
};