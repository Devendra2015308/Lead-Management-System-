const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeLeads,
} = require("../controllers/employeeController");

// All routes are protected
router.use(auth);

router.route("/createEmployees").post(createEmployee);
router.route("/getEmployees").get(getEmployees);

router
  .route("/:id")
  .get(getEmployee)
  .put(updateEmployee)
  .delete(deleteEmployee);

router.get("/:id/leads", getEmployeeLeads);

module.exports = router;
