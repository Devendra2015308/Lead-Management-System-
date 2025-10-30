import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateLead from "./pages/CreateLead";
import EditLead from "./pages/EditLead";
import Employees from "./pages/Employees";
import "./App.css";
import Leads from "./pages/Leads";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes with layout */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* These will render inside the Layout's Outlet */}
              <Route path="leads" element={<Leads />} />
              <Route path="leads/create" element={<CreateLead />} />
              <Route path="leads/edit/:id" element={<EditLead />} />
              <Route path="employees" element={<Employees />} />
              <Route index element={<Dashboard />} /> {/* Default route */}
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
