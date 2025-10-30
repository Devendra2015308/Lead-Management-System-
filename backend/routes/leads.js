const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  assignLead,
  unassignLead,
} = require("../controllers/leadController");

// All routes are protected
router.use(auth);

router.route("/").get(getLeads).post(createLead);

router.route("/:id").get(getLead).put(updateLead).delete(deleteLead);

// Lead assignment routes
router.post("/assign/:leadId/to/:employeeId", assignLead);
router.post("/unassign/:leadId/to/:employeeId", unassignLead);

module.exports = router;
