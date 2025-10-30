import React, { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/Select";
import {
  X,
  User,
  Mail,
  Building,
  Briefcase,
  Phone,
  MapPin,
} from "lucide-react";
import { employeesAPI, leadsAPI, handleApiError } from "../services/api";

const AssignLeadModal = ({ lead, isOpen, onClose, onAssign }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && lead) {
      fetchEmployees();
      setSelectedEmployee(lead.assignedTo || "");
      setError("");
    }
  }, [isOpen, lead]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeesAPI.getAllEmployees();
      if (response.data && response.data.data) {
        setEmployees(response.data.data.filter((emp) => emp.isActive));
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      const errorInfo = handleApiError(error);
      setError(`Failed to load employees: ${errorInfo.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedEmployee) {
      setError("Please select an employee");
      return;
    }

    try {
      setAssigning(true);
      setError("");

      if (lead.assignedTo === selectedEmployee) {
        onClose();
        return;
      }

      const response = await leadsAPI.assignLead(lead._id, selectedEmployee);

      if (response.data && response.data.success) {
        onAssign(
          lead._id,
          selectedEmployee,
          response.data.data.lead.assignedTo
        );
        onClose();
      }
    } catch (error) {
      console.error("Error assigning lead:", error);
      const errorInfo = handleApiError(error);
      setError(`Failed to assign lead: ${errorInfo.message}`);
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async () => {
    try {
      setAssigning(true);
      setError("");

      const response = await leadsAPI.unassignLead(lead._id, lead.assignedTo);

      if (response.data && response.data.success) {
        onAssign(lead._id, null, null);
        onClose();
      }
    } catch (error) {
      console.error("Error unassigning lead:", error);
      const errorInfo = handleApiError(error);
      setError(`Failed to unassign lead: ${errorInfo.message}`);
    } finally {
      setAssigning(false);
    }
  };

  const handleEmployeeChange = (value) => {
    setSelectedEmployee(value);
    setError("");
  };

  const handleClose = () => {
    setError("");
    setSelectedEmployee("");
    onClose();
  };

  if (!isOpen || !lead) return null;

  const currentEmployee = employees.find((emp) => emp._id === lead.assignedTo);
  const selectedEmployeeData = employees.find(
    (emp) => emp._id === selectedEmployee
  );

  // Get source display name
  const getSourceDisplayName = (source) => {
    const sourceMap = {
      website: "Website",
      facebook_ads: "Facebook Ads",
      google_ads: "Google Ads",
      referral: "Referral",
      events: "Events",
      other: "Other",
    };
    return sourceMap[source] || source;
  };

  // Get status display name and color
  const getStatusDisplay = (status) => {
    const statusMap = {
      new: { name: "New", color: "bg-blue-100 text-blue-800" },
      contacted: { name: "Contacted", color: "bg-yellow-100 text-yellow-800" },
      qualified: { name: "Qualified", color: "bg-green-100 text-green-800" },
      lost: { name: "Lost", color: "bg-red-100 text-red-800" },
      won: { name: "Won", color: "bg-emerald-100 text-emerald-800" },
    };
    return (
      statusMap[status] || { name: status, color: "bg-gray-100 text-gray-800" }
    );
  };

  const statusInfo = getStatusDisplay(lead.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Assign Lead</h2>
            <p className="text-sm text-gray-600 mt-1">
              Assign this lead to a team member
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Lead Information */}
        <div className="p-6 border-b">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 text-gray-500 mr-2" />
            Lead Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {lead.firstName} {lead.lastName}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                  >
                    {statusInfo.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{lead.email}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {lead.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{lead.phone}</span>
                </div>
              )}

              {lead.company && (
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span>{lead.company}</span>
                </div>
              )}

              {(lead.city || lead.state) && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>
                    {[lead.city, lead.state].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-gray-500" />
                <span>{getSourceDisplayName(lead.source)}</span>
              </div>
            </div>

            {(lead.score || lead.leadValue) && (
              <div className="flex space-x-4 text-sm">
                {lead.score && (
                  <div>
                    <span className="text-gray-600">Score: </span>
                    <span className="font-medium">{lead.score}/100</span>
                  </div>
                )}
                {lead.leadValue && (
                  <div>
                    <span className="text-gray-600">Value: </span>
                    <span className="font-medium">
                      ${lead.leadValue.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Current Assignment */}
        {currentEmployee && (
          <div className="p-6 border-b bg-blue-50">
            <h3 className="font-medium text-gray-900 mb-3">
              Current Assignment
            </h3>
            <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {currentEmployee.firstName} {currentEmployee.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  {currentEmployee.department} • {currentEmployee.position}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {currentEmployee.assignedLeadsCount || 0} assigned leads
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnassign}
                disabled={assigning}
                className="whitespace-nowrap"
              >
                {assigning ? "Removing..." : "Remove"}
              </Button>
            </div>
          </div>
        )}

        {/* Assignment Form */}
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Employee
              </label>
              <Select
                value={selectedEmployee}
                onValueChange={handleEmployeeChange}
                disabled={loading || assigning}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee._id} value={employee._id}>
                      {employee.firstName} {employee.lastName} -{" "}
                      {employee.department}
                      {employee.assignedLeadsCount > 0 &&
                        ` (${employee.assignedLeadsCount} leads)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loading && (
                <p className="text-sm text-gray-500 mt-1">
                  Loading employees...
                </p>
              )}
            </div>

            {/* Selected Employee Info */}
            {selectedEmployeeData && (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 text-sm mb-2">
                  Employee Information
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">
                      {selectedEmployeeData.firstName}{" "}
                      {selectedEmployeeData.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Department:</span>
                    <p className="font-medium">
                      {selectedEmployeeData.department}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Position:</span>
                    <p className="font-medium">
                      {selectedEmployeeData.position}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Current Leads:</span>
                    <p className="font-medium">
                      {selectedEmployeeData.assignedLeadsCount || 0}
                    </p>
                  </div>
                </div>
                {selectedEmployeeData.email && (
                  <div className="mt-2">
                    <span className="text-gray-600">Email:</span>
                    <p className="text-sm">{selectedEmployeeData.email}</p>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={assigning}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                disabled={!selectedEmployee || assigning || loading}
                className="flex-1"
              >
                {assigning
                  ? "Assigning..."
                  : lead.assignedTo === selectedEmployee
                  ? "Re-assign"
                  : "Assign Lead"}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-gray-50 px-6 py-3 border-t">
          <p className="text-xs text-gray-500 text-center">
            Assigned leads will appear in the employee's lead list and dashboard
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssignLeadModal;
