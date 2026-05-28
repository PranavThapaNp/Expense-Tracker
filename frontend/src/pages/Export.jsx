import { useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Export() {
  const [loading, setLoading] = useState(false);

  const downloadFile = async (url, filename) => {
    setLoading(true);

    try {
      const res = await api.get(url, {
        responseType: "blob",
      });

      const blob = new Blob([res.data]);
      const link = document.createElement("a");

      link.href = window.URL.createObjectURL(blob);
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.log(err);
      alert("Export failed (please login again)");
    }

    setLoading(false);
  };

  return (
    <div style={page}>
      <Navbar />

      <h1 style={title}>📤 Export Your Data</h1>
      <p style={subtitle}>
        Download your financial records in different formats.
      </p>

      <div style={grid}>
        <ExportCard
          title="CSV Export"
          desc="Best for Excel & data analysis"
          color="#22c55e"
          onClick={() => downloadFile("/export/csv", "expenses.csv")}
          loading={loading}
        />

        <ExportCard
          title="PDF Report"
          desc="Clean printable report"
          color="#ef4444"
          onClick={() => downloadFile("/export/pdf", "expenses.pdf")}
          loading={loading}
        />

        <ExportCard
          title="Excel Sheet"
          desc="Structured spreadsheet format"
          color="#3b82f6"
          onClick={() => downloadFile("/export/excel", "expenses.xlsx")}
          loading={loading}
        />
      </div>

      {loading && (
        <div style={loadingBox}>
          <p>📦 Preparing your file...</p>
        </div>
      )}
    </div>
  );
}

/* ================= COMPONENT ================= */
function ExportCard({ title, desc, color, onClick, loading }) {
  return (
    <div style={card}>
      <div style={{ borderLeft: `5px solid ${color}`, paddingLeft: 10 }}>
        <h3>{title}</h3>
        <p style={{ color: "#555", fontSize: "14px" }}>{desc}</p>
      </div>

      <button style={{ ...btn, background: color }} onClick={onClick} disabled={loading}>
        Download
      </button>
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
  marginBottom: "5px",
};

const subtitle = {
  marginBottom: "20px",
  color: "#666",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "15px",
};

const card = {
  background: "white",
  padding: "18px",
  borderRadius: "12px",
  boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  minHeight: "140px",
};

const btn = {
  marginTop: "15px",
  padding: "10px",
  border: "none",
  borderRadius: "8px",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};

const loadingBox = {
  marginTop: "20px",
  padding: "15px",
  background: "white",
  borderRadius: "10px",
  textAlign: "center",
};