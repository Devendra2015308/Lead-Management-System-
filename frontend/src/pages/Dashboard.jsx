import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  TrendingUp,
  FileText,
  Globe,
  Mail,
  Facebook,
  Search,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/Button";

// API configuration
const API_CONFIG = {
  BASE_URL: "http://localhost:5001/api",
  ENDPOINTS: {
    DASHBOARD_REPORT: "/dashboard/report",
  },
};

// API Service functions
const dashboardAPI = {
  getToken: () => {
    return localStorage.getItem("authToken");
  },

  getHeaders: () => {
    const token = dashboardAPI.getToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  },

  getDashboardData: async (period = "all") => {
    const response = await axios.get(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DASHBOARD_REPORT}?period=${period}`,
      {
        headers: dashboardAPI.getHeaders(),
      }
    );
    return response.data;
  },
};

// Constants
const PERIOD_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

const SOURCE_ICONS = {
  website: Globe,
  facebook_ads: Facebook,
  google_ads: Search,
  events: Calendar,
  default: Mail,
};

const SOURCE_COLORS = {
  website: "#2196f3",
  facebook_ads: "#1976d2",
  google_ads: "#34a853",
  referral: "#ff9800",
  events: "#9c27b0",
  default: "#757575",
};

const STATUS_COLORS = {
  new: "bg-blue-100 text-blue-800 border-blue-200",
  contacted: "bg-purple-100 text-purple-800 border-purple-200",
  qualified: "bg-cyan-100 text-cyan-800 border-cyan-200",
  won: "bg-green-100 text-green-800 border-green-200",
  lost: "bg-red-100 text-red-800 border-red-200",
  default: "bg-gray-100 text-gray-800 border-gray-200",
};

const CHART_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [period, setPeriod] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = dashboardAPI.getToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await dashboardAPI.getDashboardData(period);

      if (response.success) {
        const transformedData = transformApiData(response.data);
        setDashboardData(transformedData);
      } else {
        throw new Error(response.message || "Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  // Transform API data to match component structure
  const transformApiData = (apiData) => {
    // Filter only active employees for top performers
    const activeTopEmployees = (apiData.topEmployees || []).filter(
      (employee) => employee.isActive !== false
    );

    // Transform leadsBySource array to sources object
    const sources = {};
    if (apiData.leadsBySource) {
      apiData.leadsBySource.forEach((source) => {
        sources[source._id] = source.count;
      });
    }

    // Transform leadsByStatus array to status object
    const status = {};
    if (apiData.leadsByStatus) {
      apiData.leadsByStatus.forEach((statusItem) => {
        status[statusItem._id] = statusItem.count;
      });
    }

    // Create overview object with only active employees
    const overview = {
      totalLeads: apiData.totalLeads || 0,
      totalEmployees: apiData.totalEmployees || 0,
      activeEmployees: apiData.activeEmployees || 0,
      periodLeads: apiData.totalLeads || 0,
      conversionRate: calculateConversionRate(apiData),
      assignedLeads: apiData.assignedLeads || 0,
      unassignedLeads: apiData.unassignedLeads || 0,
    };

    // Create recent leads from actual data if available, otherwise use mock
    const recentLeads = apiData.recentLeads
      ? apiData.recentLeads
          .filter(
            (lead) => !lead.assignedTo || lead.assignedTo.isActive !== false
          )
          .slice(0, 5)
      : createMockRecentLeads(activeTopEmployees, sources, status);

    return {
      sources,
      status,
      overview,
      recentLeads,
      employeePerformance: activeTopEmployees,
      period: period,
    };
  };

  // Create mock recent leads for demonstration
  const createMockRecentLeads = (employees, sources, status) => {
    if (!employees.length) return [];

    return employees
      .flatMap((employee) =>
        Array.from(
          { length: Math.min(employee.assignedLeadsCount || 0, 2) },
          (_, i) => ({
            _id: `mock-lead-${employee._id}-${i}`,
            firstName: `Lead${i + 1}`,
            lastName: `From${employee.firstName}`,
            source: getRandomSource(sources),
            status: getRandomStatus(status),
            assignedTo: {
              _id: employee._id,
              firstName: employee.firstName,
              lastName: employee.lastName,
              isActive: employee.isActive,
            },
          })
        )
      )
      .slice(0, 5);
  };

  const getRandomSource = (sources) => {
    const sourceKeys = Object.keys(sources);
    return sourceKeys.length > 0
      ? sourceKeys[Math.floor(Math.random() * sourceKeys.length)]
      : "website";
  };

  const getRandomStatus = (status) => {
    const statusKeys = Object.keys(status);
    return statusKeys.length > 0
      ? statusKeys[Math.floor(Math.random() * statusKeys.length)]
      : "new";
  };

  // Helper function to calculate conversion rate
  const calculateConversionRate = (apiData) => {
    if (!apiData.leadsByStatus || apiData.totalLeads === 0) return 0;

    const wonLeads = apiData.leadsByStatus.find(
      (status) => status._id === "won"
    );
    const wonCount = wonLeads ? wonLeads.count : 0;

    return Math.round((wonCount / apiData.totalLeads) * 100);
  };

  const getSourceIcon = (source) => {
    const IconComponent = SOURCE_ICONS[source] || SOURCE_ICONS.default;
    return <IconComponent className="h-3 w-3" />;
  };

  const getSourceColor = (source) => {
    return SOURCE_COLORS[source] || SOURCE_COLORS.default;
  };

  const getStatusColor = (status) => {
    return STATUS_COLORS[status] || STATUS_COLORS.default;
  };

  const getEmployeeInitials = (employee) => {
    return `${employee.firstName?.[0] || "E"}${employee.lastName?.[0] || "E"}`;
  };

  const getEmployeeDisplayName = (employee) => {
    return (
      `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
      "Unknown Employee"
    );
  };

  // Loading component
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error component
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading dashboard data</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  // No data component
  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">No dashboard data available</p>
          <Button
            onClick={fetchDashboardData}
            className="mt-2 text-sm text-primary hover:underline"
          >
            Refresh data
          </Button>
        </div>
      </div>
    );
  }

  // Safe data preparation with fallbacks
  const { sources, status, overview, recentLeads, employeePerformance } =
    dashboardData;

  // Prepare data for charts with safe object handling
  const sourceChartData = Object.entries(sources)
    .filter(([_, count]) => count > 0)
    .map(([source, count]) => ({
      name: source.replace(/_/g, " ").toUpperCase(),
      value: count,
      color: getSourceColor(source),
    }));

  const statusChartData = Object.entries(status)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: status.toUpperCase(),
      count,
      color: getSourceColor(status),
    }));

  const maxLeads = Math.max(
    ...employeePerformance.map((e) => e?.assignedLeadsCount || 0),
    1
  );

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Label htmlFor="period" className="text-sm">
            Period
          </Label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Total Leads
                </p>
                <h2 className="text-3xl font-bold">
                  {overview.totalLeads || 0}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {overview.assignedLeads || 0} assigned •{" "}
                  {overview.unassignedLeads || 0} unassigned
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Employees Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Active Employees
                </p>
                <h2 className="text-3xl font-bold">
                  {overview.activeEmployees || 0}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {overview.totalEmployees || 0} total employees
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Conversion Rate
                </p>
                <h2 className="text-3xl font-bold">
                  {overview.conversionRate || 0}%
                </h2>
                <p className="text-sm text-muted-foreground">
                  Lead to customer
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Period Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Period
                </p>
                <h2 className="text-xl font-bold capitalize">
                  {dashboardData.period || "all"}
                </h2>
                <p className="text-sm text-muted-foreground">Data filter</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sources Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Leads by Source</CardTitle>
          </CardHeader>
          <CardContent>
            {sourceChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sourceChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sourceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-[300px]">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Leads by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Number of Leads">
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-[300px]">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLeads.map((lead) => (
                  <TableRow key={lead._id}>
                    <TableCell className="font-medium">
                      {lead.firstName} {lead.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 w-fit"
                      >
                        {getSourceIcon(lead.source)}
                        {lead.source?.replace(/_/g, " ") || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(lead.status)}
                      >
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lead.assignedTo ? (
                        getEmployeeDisplayName(lead.assignedTo)
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {recentLeads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <p className="text-muted-foreground">No recent leads</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Performers (Active Employees Only) */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <p className="text-sm text-muted-foreground">
              Showing {employeePerformance.length} active employees
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employeePerformance.map((employee, index) => (
                <div key={employee._id} className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback
                      className={`
                      ${index % 5 === 0 ? "bg-blue-100 text-blue-800" : ""}
                      ${index % 5 === 1 ? "bg-green-100 text-green-800" : ""}
                      ${index % 5 === 2 ? "bg-amber-100 text-amber-800" : ""}
                      ${index % 5 === 3 ? "bg-purple-100 text-purple-800" : ""}
                      ${index % 5 === 4 ? "bg-cyan-100 text-cyan-800" : ""}
                    `}
                    >
                      {getEmployeeInitials(employee)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm truncate">
                        {getEmployeeDisplayName(employee)}
                      </p>
                      <span className="text-sm text-muted-foreground ml-2">
                        {employee.assignedLeadsCount || 0} leads
                      </span>
                    </div>
                    <Progress
                      value={Math.min(
                        ((employee.assignedLeadsCount || 0) / maxLeads) * 100,
                        100
                      )}
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
              {employeePerformance.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No active employee data available
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
