import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";

import Expenses from "./pages/Expenses";
import Budget from "./pages/Budget";
import Goals from "./pages/Goals";
import Export from "./pages/Export";
import Intelligence from "./pages/Intelligence";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* DEFAULT */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* EXPENSES */}
        <Route
          path="/expenses"
          element={
            <PrivateRoute>
              <Expenses />
            </PrivateRoute>
          }
        />

        {/* BUDGET */}
        <Route
          path="/budget"
          element={
            <PrivateRoute>
              <Budget />
            </PrivateRoute>
          }
        />

        {/* GOALS */}
        <Route
          path="/goals"
          element={
            <PrivateRoute>
              <Goals />
            </PrivateRoute>
          }
        />

        {/* EXPORT */}
        <Route
          path="/export"
          element={
            <PrivateRoute>
              <Export />
            </PrivateRoute>
          }
        />

        {/* AI / INSIGHTS */}
        <Route
          path="/intelligence"
          element={
            <PrivateRoute>
              <Intelligence />
            </PrivateRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/dashboard" />} />

      </Routes>
    </BrowserRouter>
  );
}