import React, { useState, useEffect } from "react";
import { leadsAPI, employeesAPI, handleApiError } from "../services/api";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/Table";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AssignLeadModal from "./AssignLeadModal";

const SOURCE_OPTIONS = [
  { value: "website", label: "WEBSITE" },
  { value: "facebook_ads", label: "FACEBOOK ADS" },
  { value: "google_ads", label: "GOOGLE ADS" },
  { value: "referral", label: "REFERRAL" },
  { value: "events", label: "EVENTS" },
  { value: "other", label: "OTHER" },
];

const STATUS_OPTIONS = [
  { value: "new", label: "NEW" },
  { value: "contacted", label: "CONTACTED" },
  { value: "qualified", label: "QUALIFIED" },
  { value: "lost", label: "LOST" },
  { value: "won", label: "WON" },
];

const STATUS_COLORS = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
  won: "bg-emerald-100 text-emerald-800",
};

const LeadsGrid = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [assignModal, setAssignModal] = useState({
    isOpen: false,
    lead: null,
  });
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
    fetchEmployees();
  }, [pagination.page, pagination.limit, filters]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };

      const response = await leadsAPI.getLeads(params);
      setLeads(response.data.data || response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages,
      }));
    } catch (error) {
      console.error("Error fetching leads:", error);
      const apiError = handleApiError(error);
      alert(`Failed to fetch leads: ${apiError.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeesAPI.getAllEmployees();
      setEmployees(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      const apiError = handleApiError(error);
      alert(`Failed to fetch employees: ${apiError.message}`);
    }
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: value === "all" ? undefined : value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({});
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) {
      return;
    }

    try {
      await leadsAPI.deleteLead(leadId);
      fetchLeads(); // Refresh the list
    } catch (error) {
      console.error("Error deleting lead:", error);
      const apiError = handleApiError(error);
      alert(`Failed to delete lead: ${apiError.message}`);
    }
  };

  const handleAssignLead = (lead) => {
    setAssignModal({
      isOpen: true,
      lead: lead,
    });
  };

  const handleAssignmentUpdate = (
    leadId,
    employeeId,
    assignedEmployeeData = null
  ) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead._id === leadId
          ? {
              ...lead,
              assignedTo: employeeId,
              assignedToEmployee:
                assignedEmployeeData ||
                (employeeId
                  ? employees.find((emp) => emp._id === employeeId)
                  : null),
            }
          : lead
      )
    );

    fetchEmployees();
  };

  const handleCloseAssignModal = () => {
    setAssignModal({
      isOpen: false,
      lead: null,
    });
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find((emp) => emp._id === employeeId);
    return employee
      ? `${employee.firstName} ${employee.lastName}`
      : "Unassigned";
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const formatCurrency = (value) => {
    return value ? `₹${value.toLocaleString()}` : "-";
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : "-";
  };

  // Helper function to get display value for filters
  const getFilterDisplayValue = (filterKey) => {
    return filters[filterKey] || "all";
  };

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
        <Button
          onClick={() => navigate("/leads/create")}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Lead</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Filters</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1"
            >
              <Filter className="h-4 w-4" />
              <span>{showFilters ? "Hide" : "Show"} Filters</span>
            </Button>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <Input
                placeholder="Search name, email, company..."
                value={filters.firstName_contains || ""}
                onChange={(e) =>
                  handleFilterChange("firstName_contains", e.target.value)
                }
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select
                value={getFilterDisplayValue("status_eq")}
                onValueChange={(value) =>
                  handleFilterChange("status_eq", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Source Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Source</label>
              <Select
                value={getFilterDisplayValue("source_eq")}
                onValueChange={(value) =>
                  handleFilterChange("source_eq", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {SOURCE_OPTIONS.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Qualified Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Qualified
              </label>
              <Select
                value={getFilterDisplayValue("isQualified_eq")}
                onValueChange={(value) =>
                  handleFilterChange("isQualified_eq", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Qualified</SelectItem>
                  <SelectItem value="false">Not Qualified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assignment Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Assignment
              </label>
              <Select
                value={getFilterDisplayValue("assignedTo_eq")}
                onValueChange={(value) =>
                  handleFilterChange("assignedTo_eq", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          Showing {leads.length} of {pagination.total} leads
        </span>
        <div className="flex space-x-4">
          <span>
            Assigned: {leads.filter((lead) => lead.assignedTo).length}
          </span>
          <span>
            Unassigned: {leads.filter((lead) => !lead.assignedTo).length}
          </span>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No leads found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow
                  key={lead._id}
                  className={lead.assignedTo ? "bg-blue-50" : ""}
                >
                  <TableCell>{formatDate(lead.createdAt)}</TableCell>
                  <TableCell className="font-medium">
                    {lead.firstName} {lead.lastName}
                  </TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.company || "-"}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        STATUS_COLORS[lead.status]
                      }`}
                    >
                      {lead.status.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    {SOURCE_OPTIONS.find((s) => s.value === lead.source)
                      ?.label || lead.source.replace("_", " ").toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {lead.assignedTo ? (
                        <>
                          <UserCheck className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">
                            {lead.assignedToEmployee
                              ? `${lead.assignedToEmployee.firstName} ${lead.assignedToEmployee.lastName}`
                              : getEmployeeName(lead.assignedTo)}
                          </span>
                        </>
                      ) : (
                        <>
                          <UserX className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            Unassigned
                          </span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{lead.score}</TableCell>
                  <TableCell>{formatCurrency(lead.leadValue)}</TableCell>

                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/leads/edit/${lead._id}`)}
                        title="Edit lead"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={lead.assignedTo ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleAssignLead(lead)}
                        title={
                          lead.assignedTo ? "Reassign lead" : "Assign lead"
                        }
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteLead(lead._id)}
                        title="Delete lead"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter(
              (page) =>
                page === 1 ||
                page === pagination.totalPages ||
                Math.abs(page - pagination.page) <= 2
            )
            .map((page, index, array) => (
              <React.Fragment key={page}>
                {index > 0 && array[index - 1] !== page - 1 && (
                  <span className="px-2">...</span>
                )}
                <Button
                  variant={page === pagination.page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              </React.Fragment>
            ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Assignment Modal */}
      <AssignLeadModal
        lead={assignModal.lead}
        isOpen={assignModal.isOpen}
        onClose={handleCloseAssignModal}
        onAssign={handleAssignmentUpdate}
      />
    </div>
  );
};

export default LeadsGrid;
