import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Origin: window.location.origin,
  },
  xsrfCookieName: "token",
  xsrfHeaderName: "X-CSRF-TOKEN",
});

// Request interceptor for debugging and token handling
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);

    const token = localStorage.getItem("authToken");
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Added token to Authorization header from localStorage");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(
      `API Response: ${
        response.status
      } ${response.config.method?.toUpperCase()} ${response.config.url}`
    );
    return response;
  },
  async (error) => {
    console.error("API Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message,
      data: error.response?.data,
    });

    if (!error.response) {
      console.error("Network error - no response received");
    }

    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/auth/me")
    ) {
      console.log(
        "Unauthorized access - clearing token and redirecting to login"
      );
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/me"),
};

// Leads API calls
export const leadsAPI = {
  getLeads: (params) => api.get("/leads", { params }),
  getLead: (id) => api.get(`/leads/${id}`),
  createLead: (leadData) => api.post("/leads", leadData),
  updateLead: (id, leadData) => api.put(`/leads/${id}`, leadData),
  deleteLead: (id) => api.delete(`/leads/${id}`),
  assignLead: async (leadId, employeeId) => {
    const response = await api.post(`/leads/assign/${leadId}/to/${employeeId}`);
    return response;
  },
  unassignLead: async (leadId, employeeId) => {
    const response = await api.post(
      `/leads/unassign/${leadId}/to/${employeeId}`
    );
    return response;
  },
};

// Employees API calls
export const employeesAPI = {
  getAllEmployees: () => api.get("/employees/getEmployees"),
  getEmployee: (id) => api.get(`/employees/${id}`),
  createEmployee: (employeeData) =>
    api.post("/employees/createEmployees", employeeData),
  updateEmployee: (id, employeeData) =>
    api.put(`/employees/${id}`, employeeData),
  deleteEmployee: (id) => api.delete(`/employees/${id}`),
  getEmployeeLeads: (id) => api.get(`/employees/${id}/leads`),
  updateEmployeeStatus: (id, status) =>
    api.patch(`/employees/${id}/status`, { status }),
};

// Health check API
export const healthAPI = {
  check: () => api.get("/health"),
  corsTest: () => api.get("/cors-test"),
  cookieTest: () => api.get("/cookie-test"),
};

// Utility function to handle API errors
export const handleApiError = (error) => {
  if (error.response) {
    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      "An error occurred";
    const details = error.response.data?.errors || error.response.data?.details;

    return {
      message,
      details,
      status: error.response.status,
      statusText: error.response.statusText,
    };
  } else if (error.request) {
    return {
      message: "Network error: Unable to connect to server",
      details: "Please check your internet connection and try again",
      status: 0,
      statusText: "Network Error",
    };
  } else {
    return {
      message: error.message || "An unexpected error occurred",
      details: null,
      status: -1,
      statusText: "Client Error",
    };
  }
};

// Utility function to build query parameters for filters
export const buildQueryParams = (filters = {}) => {
  const params = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params[key] = value;
    }
  });

  return params;
};

export default api;
