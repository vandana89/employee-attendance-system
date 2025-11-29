// routes/dashboardRoutes.js
const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireManager } = require("../middleware/roleMiddleware");
const {
  getEmployeeDashboard,
  getManagerDashboard,
} = require("../controllers/dashboardController");

const router = express.Router();

// Employee dashboard
router.get("/employee", protect, getEmployeeDashboard);

// Manager dashboard
router.get("/manager", protect, requireManager, getManagerDashboard);

module.exports = router;
