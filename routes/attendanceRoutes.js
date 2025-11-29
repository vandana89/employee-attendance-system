// routes/attendanceRoutes.js
const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireManager } = require("../middleware/roleMiddleware");

const {
  // employee
  checkIn,
  checkOut,
  getMyHistory,
  getMySummary,
  getTodayStatus,
  // manager
  getAllAttendance,
  getEmployeeAttendance,
  getTeamSummary,
  exportAttendanceCSV,
  getTodayTeamStatus,
  getAttendanceReport, // 👈 add
} = require("../controllers/attendanceController");

const router = express.Router();

// -------- EMPLOYEE ROUTES --------
router.post("/checkin", protect, checkIn);
router.post("/checkout", protect, checkOut);
router.get("/my-history", protect, getMyHistory);
router.get("/my-summary", protect, getMySummary);
router.get("/today", protect, getTodayStatus);

// -------- MANAGER ROUTES --------
router.get("/all", protect, requireManager, getAllAttendance);
router.get("/employee/:id", protect, requireManager, getEmployeeAttendance);
router.get("/summary", protect, requireManager, getTeamSummary);
router.get("/export", protect, requireManager, exportAttendanceCSV);
router.get("/today-status", protect, requireManager, getTodayTeamStatus);
router.get("/report", protect, requireManager, getAttendanceReport); 

module.exports = router;
