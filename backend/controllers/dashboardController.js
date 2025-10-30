const Lead = require("../models/Lead");
const Employee = require("../models/Employee");
const User = require("../models/User");

const getReport = async (req, res) => {
  try {
    // 1) Total Counts
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ isActive: true });
    const totalLeads = await Lead.countDocuments();

    // 2) Leads grouped by status
    const leadsByStatus = await Lead.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // 3) Leads grouped by source
    const leadsBySource = await Lead.aggregate([
      { $group: { _id: "$source", count: { $sum: 1 } } }
    ]);

    // 4) Assigned vs Unassigned Leads
    const assignedLeads = await Lead.countDocuments({ assignedTo: { $ne: null } });
    const unassignedLeads = await Lead.countDocuments({ assignedTo: null });

    // 5) Top Employees by Assigned Leads
    const topEmployees = await Employee.find()
      .sort({ assignedLeadsCount: -1 })
      .limit(5)
      .select("firstName lastName email assignedLeadsCount");

    return res.status(200).json({
      success: true,
      message: "Report fetched successfully",
      data: {
        totalEmployees,
        activeEmployees,
        totalLeads,
        assignedLeads,
        unassignedLeads,
        leadsByStatus,
        leadsBySource,
        topEmployees
      }
    });

  } catch (error) {
    console.error("Report Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = { getReport };
