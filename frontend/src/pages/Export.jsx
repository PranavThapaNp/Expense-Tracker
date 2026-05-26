import { useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Export() {
  const [loading, setLoading] = useState(false);

  const downloadFile = async (url, filename) => {
    setLoading(true);

    try {
      const res = await api.get(url, {
        responseType: "blob", // IMPORTANT for files
      });

      const blob = new Blob([res.data]);
      const link = document.createElement("a");

      link.href = window.URL.createObjectURL(blob);
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.log(err.response?.data || err);
      alert("Export failed (check login)");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Navbar />

      <h1>📤 Export Data</h1>

      <button
        onClick={() => downloadFile("/export/csv", "expenses.csv")}
        disabled={loading}
      >
        CSV
      </button>

      <button
        onClick={() => downloadFile("/export/pdf", "expenses.pdf")}
        disabled={loading}
      >
        PDF
      </button>

      <button
        onClick={() => downloadFile("/export/excel", "expenses.xlsx")}
        disabled={loading}
      >
        Excel
      </button>

      {loading && <p>Downloading...</p>}
    </div>
  );
}