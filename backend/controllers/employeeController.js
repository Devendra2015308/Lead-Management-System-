const Employee = require("../models/Employee");
const Lead = require("../models/Lead");

// Get all employees with pagination and filters
const getEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    // Build filter query
    const filterQuery = { userId: req.user._id };

    if (req.query.department) {
      filterQuery.department = { $regex: req.query.department, $options: "i" };
    }

    if (req.query.isActive !== undefined) {
      filterQuery.isActive = req.query.isActive === "true";
    }

    // Build sort query
    const sortQuery = {};
    if (req.query.sort) {
      const [field, order] = req.query.sort.split(":");
      sortQuery[field] = order === "desc" ? -1 : 1;
    } else {
      sortQuery.createdAt = -1;
    }

    const [employees, total] = await Promise.all([
      Employee.find(filterQuery).sort(sortQuery).skip(skip).limit(limit).lean(),
      Employee.countDocuments(filterQuery),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      data: employees,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Get employees error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single employee
const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(employee);
  } catch (error) {
    console.error("Get employee error:", error);
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// Create new employee
const createEmployee = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, department, position } =
      req.body;

    // Validate Required Fields
    if (!firstName || !lastName || !email || !department || !position) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Check if employee already exists for this user
    const existingEmployee = await Employee.findOne({
      userId: req?.user?._id,
      email,
    });
    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: "Employee with this email already exists for your account",
      });
    }

    // Create employee data object
    const employeeData = {
      userId: req?.user?._id,
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
    };

    // Save employee
    const employee = await Employee.create(employeeData);

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: { employee },
    });
  } catch (error) {
    console.error("Create Employee Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  try {
    const { firstName, lastName, email, department, position } = req.body;

    // Required fields validation
    if (!firstName || !lastName || !email || !department || !position) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Check if another employee is already using this email
    const existing = await Employee.findOne({
      email,
      _id: { $ne: req.params.id },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Another employee already uses this email",
      });
    }

    // Update employee
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    console.error("Update Employee Error:", error);

    // Validation error
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors,
      });
    }

    // Invalid ID format
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Delete employee (soft delete by setting isActive to false)
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Delete employee error:", error);
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// Get leads assigned to an employee
const getEmployeeLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    // Verify employee exists and belongs to user
    const employee = await Employee.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const [leads, total] = await Promise.all([
      Lead.find({ assignedTo: req.params.id, userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Lead.countDocuments({ assignedTo: req.params.id, userId: req.user._id }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      data: leads,
      employee: {
        id: employee._id,
        name: `${employee.firstName} ${employee.lastName}`,
        email: employee.email,
      },
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Get employee leads error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeLeads,
};
