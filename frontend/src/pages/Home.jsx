import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div style={page}>
      <Navbar />

      {/* ================= HERO SECTION ================= */}
      <section style={heroSection}>
        <div style={heroContent}>
          <p style={heroTag}>SMART FINANCIAL MANAGEMENT</p>

          <h1 style={heroTitle}>
            Track Your Expenses.
            <br />
            Control Your Future.
          </h1>

          <p style={heroSubtitle}>
            Expense Tracker helps you monitor spending,
            manage budgets, analyze financial habits,
            and make smarter money decisions — all in one place.
          </p>

          <Link to="/expenses" style={ctaButton}>
            Get Started →
          </Link>
        </div>

        <div style={heroImageContainer}>
          <img
            src="https://images.unsplash.com/photo-1554224155-6726b3ff858f"
            alt="Finance"
            style={heroImage}
          />
        </div>
      </section>

      {/* ================= ABOUT SECTION ================= */}
      <section style={aboutSection}>
        <h2 style={sectionTitle}>About Expense Tracker</h2>

        <div style={aboutGrid}>
          <div style={aboutCard}>
            <img
              src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a"
              alt="Expense Tracker"
              style={aboutImage}
            />

            <h3>About the Project</h3>

            <p style={aboutText}>
              Expense Tracker is a modern financial management
              platform designed to help users track expenses,
              analyze spending habits, manage budgets,
              and improve savings efficiently.
            </p>
          </div>

          <div style={aboutCard}>
            <img
              src="/images/pranavthapa.jpg"
              alt="Developer"
              style={aboutImage}
            />

            <h3>About Me</h3>

            <p style={aboutText}>
              Hi, I'm Pranav — a student and developer passionate
              about building useful and intelligent web applications.
              This project was created to combine finance management
              with clean UI and smart analytics.
            </p>
          </div>
        </div>
      </section>

      {/* ================= CONTACT SECTION ================= */}
      <section style={contactSection}>
        <h2 style={sectionTitle}>Contact Us</h2>

        <div style={contactCard}>
          <p style={contactText}>
            📧 Email: prnvthpa@example.com
          </p>

          <p style={contactText}>
            📱 Phone: +977-9763385107
          </p>

          <p style={contactDescription}>
            Feel free to reach out for feedback,
            collaboration, or project inquiries.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ================= STYLES ================= */

const page = {
  background: "#f5f7fb",
  minHeight: "100vh",
  color: "#111827",
};

/* HERO */

const heroSection = {
  minHeight: "90vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "20px 8%",
  gap: "50px",
  flexWrap: "wrap",
};

const heroContent = {
  flex: 1,
  minWidth: "320px",
};

const heroTag = {
  color: "#2563eb",
  fontWeight: "bold",
  letterSpacing: "1px",
  marginBottom: "15px",
};

const heroTitle = {
  fontSize: "56px",
  lineHeight: "1.1",
  marginBottom: "25px",
};

const heroSubtitle = {
  fontSize: "18px",
  color: "#6b7280",
  lineHeight: "1.8",
  maxWidth: "600px",
  marginBottom: "35px",
};

const ctaButton = {
  display: "inline-block",
  background: "#2563eb",
  color: "white",
  padding: "15px 28px",
  borderRadius: "12px",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "16px",
  boxShadow: "0 10px 25px rgba(37,99,235,0.3)",
};

const heroImageContainer = {
  flex: 1,
  minWidth: "320px",
  display: "flex",
  justifyContent: "center",
};

const heroImage = {
  width: "100%",
  maxWidth: "550px",
  borderRadius: "25px",
  objectFit: "cover",
  boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
};

/* ABOUT */

const aboutSection = {
  padding: "40px 8%",
};

const sectionTitle = {
  fontSize: "40px",
  marginBottom: "40px",
  textAlign: "center",
};

const aboutGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "30px",
};

const aboutCard = {
  background: "white",
  padding: "25px",
  borderRadius: "20px",
  boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
};

const aboutImage = {
  width: "100%",
  height: "250px",
  objectFit: "cover",
  borderRadius: "15px",
  marginBottom: "20px",
};

const aboutText = {
  color: "#6b7280",
  lineHeight: "1.8",
  marginTop: "10px",
};

/* CONTACT */

const contactSection = {
  padding: "80px 8%",
};

const contactCard = {
  background: "white",
  maxWidth: "700px",
  margin: "0 auto",
  padding: "40px",
  borderRadius: "20px",
  textAlign: "center",
  boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
};

const contactText = {
  fontSize: "20px",
  marginBottom: "15px",
  fontWeight: "600",
};

const contactDescription = {
  color: "#6b7280",
  marginTop: "25px",
  lineHeight: "1.7",
};