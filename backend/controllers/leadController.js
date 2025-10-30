const Employee = require("../models/Employee");
const Lead = require("../models/Lead");

// Helper function to build filter query
const buildFilterQuery = (filters, userId) => {
  const query = { userId };

  Object.keys(filters).forEach((key) => {
    const [field, operator] = key.split("_");
    const value = filters[key];

    if (!value) return;

    switch (operator) {
      case "eq":
        if (field === "isQualified") {
          query[field] = value === "true";
        } else {
          query[field] = value;
        }
        break;
      case "contains":
        query[field] = { $regex: value, $options: "i" };
        break;
      case "in":
        query[field] = { $in: value.split(",") };
        break;
      case "gt":
        query[field] = { $gt: Number(value) };
        break;
      case "lt":
        query[field] = { $lt: Number(value) };
        break;
      case "between":
        const [min, max] = value.split(",");
        if (field.includes("At")) {
          query[field] = {
            $gte: new Date(min),
            $lte: new Date(max),
          };
        } else {
          query[field] = {
            $gte: Number(min),
            $lte: Number(max),
          };
        }
        break;
      case "before":
        query[field] = { $lt: new Date(value) };
        break;
      case "after":
        query[field] = { $gt: new Date(value) };
        break;
      case "on":
        const date = new Date(value);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        query[field] = {
          $gte: date,
          $lt: nextDay,
        };
        break;
    }
  });

  return query;
};

// Get all leads with pagination and filters
const getLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    // Build filter query
    const filters = { ...req.query };
    delete filters.page;
    delete filters.limit;
    delete filters.sort;

    const filterQuery = buildFilterQuery(filters, req.user._id);

    // Build sort query
    const sortQuery = {};
    if (req.query.sort) {
      const [field, order] = req.query.sort.split(":");
      sortQuery[field] = order === "desc" ? -1 : 1;
    } else {
      sortQuery.createdAt = -1; // Default sort by newest
    }

    // Execute queries
    const [leads, total] = await Promise.all([
      Lead.find(filterQuery).sort(sortQuery).skip(skip).limit(limit).lean(),
      Lead.countDocuments(filterQuery),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      data: leads,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Get leads error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single lead
const getLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(lead);
  } catch (error) {
    console.error("Get lead error:", error);
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// Create new lead
const createLead = async (req, res) => {
  try {
    const leadData = {
      ...req.body,
      userId: req.user._id,
    };

    const lead = new Lead(leadData);
    await lead.save();

    res.status(201).json(lead);
  } catch (error) {
    console.error("Create lead error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation error",
        errors,
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A lead with this email already exists",
      });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// Update lead
const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(lead);
  } catch (error) {
    console.error("Update lead error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation error",
        errors,
      });
    }
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// Delete lead
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error("Delete lead error:", error);
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// Assign lead to employee
const assignLead = async (req, res) => {
  try {
    const { employeeId, leadId } = req.params;

    // 1) Check Employee Exists & Active
    const employee = await Employee.findOne({
      _id: employeeId,
      isActive: true,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found or inactive",
      });
    }

    // 2) Check if lead exists
    const existingLead = await Lead.findById(leadId);

    if (!existingLead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // 3) If assigned to same employee → Stop
    if (existingLead.assignedTo?.toString() === employeeId) {
      return res.status(400).json({
        success: false,
        message: "This lead is already assigned to this employee",
      });
    }

    // 4) If assigned to another employee → Stop
    if (existingLead.assignedTo) {
      return res.status(400).json({
        success: false,
        message: "This lead is already assigned to another employee",
      });
    }

    // 5) Assign Lead
    const lead = await Lead.findByIdAndUpdate(
      leadId,
      {
        assignedTo: employeeId,
        assignedAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    ).populate("assignedTo", "firstName lastName email");

    // 6) Increase employee lead count
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      { $inc: { assignedLeadsCount: 1 } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Lead assigned successfully",
      data: {
        lead,
        assignedLeadsCount: updatedEmployee.assignedLeadsCount,
      },
    });
  } catch (error) {
    console.error("Assign Lead Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Unassign lead from employee
const unassignLead = async (req, res) => {
  try {
    const { employeeId, leadId } = req.params;

    // Check lead belongs to the employee
    const lead = await Lead.findOne({ _id: leadId, assignedTo: employeeId });
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead is not assigned to this employee",
      });
    }

    // Reduce employee assigned count
    await Employee.findByIdAndUpdate(employeeId, {
      $inc: { assignedLeadsCount: -1 },
    });

    // Remove assignment
    lead.assignedTo = null;
    lead.assignedAt = null;
    await lead.save();

    res.status(200).json({
      success: true,
      message: "Lead unassigned successfully",
      data: lead,
    });
  } catch (error) {
    console.error("Unassign Lead Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  assignLead,
  unassignLead,
};
