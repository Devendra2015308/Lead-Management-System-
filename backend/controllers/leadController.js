const Lead = require("../models/Lead");
const Employee = require("../models/Employee");

// CREATE LEAD
const createLead = async (req, res) => {
  try {
    const leadData = {
      ...req.body,
      userId: req.user._id,
    };

    const lead = new Lead(leadData);
    await lead.save();

    // ✅ Emit event for admins
    req.app.get("emitNewLead")(lead);

    return res.status(201).json({
      success: true,
      message: "Lead created successfully.",
      data: lead,
    });
  } catch (error) {
    console.error("Create Lead Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// UPDATE LEAD
const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!lead)
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });

    // Emit update to all relevant dashboards
    req.app.get("emitLeadUpdate")(lead);

    return res.json({
      success: true,
      message: "Lead updated successfully.",
      data: lead,
    });
  } catch (error) {
    console.error("Update Lead Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ASSIGN LEAD TO EMPLOYEE
const assignLead = async (req, res) => {
  try {
    const { leadId, employeeId } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });

    const lead = await Lead.findByIdAndUpdate(
      leadId,
      {
        assignedTo: employeeId,
        assignedAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    ).populate("assignedTo", "firstName lastName email phone");

    if (!lead)
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });

    // Update employee count
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      { $inc: { assignedLeadsCount: 1 } },
      { new: true }
    );

    // Emit event (employee dashboard + admin dashboard update)
    req.app.get("emitLeadUpdate")(lead);

    return res.status(200).json({
      success: true,
      message: "Lead assigned successfully",
      data: { lead, assignedLeadsCount: updatedEmployee.assignedLeadsCount },
    });
  } catch (error) {
    console.error("Assign Lead Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// UNASSIGN LEAD
const unassignLead = async (req, res) => {
  try {
    const { leadId } = req.body;

    const lead = await Lead.findById(leadId);
    if (!lead)
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });

    const employeeId = lead.assignedTo;

    lead.assignedTo = null;
    lead.assignedAt = null;
    await lead.save();

    // ✅ Decrease employee count if previously assigned
    if (employeeId) {
      await Employee.findByIdAndUpdate(employeeId, {
        $inc: { assignedLeadsCount: -1 },
      });
    }

    // ✅ Emit event to everyone
    req.app.get("emitLeadUpdate")(lead);

    return res.status(200).json({
      success: true,
      message: "Lead unassigned successfully",
      data: lead,
    });
  } catch (error) {
    console.error("Unassign Lead Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  createLead,
  updateLead,
  assignLead,
  unassignLead,
};
