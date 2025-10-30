import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);

      // Store token in localStorage for cross-device compatibility
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
        console.log("Token stored in localStorage");
      }

      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      await authAPI.register(userData);
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear token from localStorage
      localStorage.removeItem("authToken");
      setUser(null);
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Pass token in header
      const response = await authAPI.getCurrentUser(token);
      setUser(response.data.user);
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("authToken");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
