// controllers/dashboardController.js
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const { getTodayDateString } = require("../utils/dateUtils");

// ===================== EMPLOYEE DASHBOARD =====================

/**
 * GET /api/dashboard/employee
 */
const getEmployeeDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = getTodayDateString();

    // Today's status
    const todayRecord = await Attendance.findOne({ user: userId, date: today });

    // Last 7 days
    const recent = await Attendance.find({ user: userId })
      .sort({ date: -1 })
      .limit(7);

    // Monthly summary
    const monthPrefix = today.slice(0, 7); // "YYYY-MM"
    const monthlyRecords = await Attendance.find({
      user: userId,
      date: { $regex: `^${monthPrefix}` },
    });

    let present = 0,
      late = 0,
      halfDay = 0,
      absent = 0,
      totalHours = 0;

    monthlyRecords.forEach((r) => {
      if (r.status === "present") present++;
      else if (r.status === "late") late++;
      else if (r.status === "half-day") halfDay++;
      else if (r.status === "absent") absent++;

      totalHours += r.totalHours || 0;
    });

    res.json({
      todayStatus: todayRecord || null,
      monthlySummary: {
        present,
        absent,
        late,
        halfDay,
        totalHours: Math.round(totalHours * 100) / 100,
      },
      recentAttendance: recent,
    });
  } catch (error) {
    console.error("Employee dashboard error:", error);
    res.status(500).json({ message: "Server error in dashboard" });
  }
};

// ===================== MANAGER DASHBOARD =====================

/**
 * GET /api/dashboard/manager
 */
const getManagerDashboard = async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ role: "employee" });

    const today = getTodayDateString();
    const todayRecords = await Attendance.find({ date: today }).populate(
      "user",
      "department name employeeId"
    );

    let present = 0,
      absent = 0;

    const lateArrivals = [];
    const absentEmployees = [];

    todayRecords.forEach((r) => {
      if (["present", "late", "half-day"].includes(r.status)) present++;
      if (r.status === "late") lateArrivals.push(r);

      if (r.status === "absent") {
        absent++;
        absentEmployees.push(r);
      }
    });

    // Weekly trend
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);

    const allRecent = await Attendance.find({
      createdAt: { $gte: sevenDaysAgo, $lte: now },
    });

    const weeklyTrend = {};
    allRecent.forEach((r) => {
      const d = r.date;
      if (!weeklyTrend[d]) weeklyTrend[d] = 0;
      if (["present", "late", "half-day"].includes(r.status)) {
        weeklyTrend[d] += 1;
      }
    });

    // Department-wise stats
    const deptStats = {};
    todayRecords.forEach((r) => {
      const dep = r.user?.department || "Unknown";

      if (!deptStats[dep]) {
        deptStats[dep] = { present: 0, absent: 0 };
      }

      if (["present", "late", "half-day"].includes(r.status)) {
        deptStats[dep].present++;
      } else if (r.status === "absent") {
        deptStats[dep].absent++;
      }
    });

    res.json({
      totalEmployees,
      today: {
        present,
        absent,
        lateArrivals,
        absentEmployees,
      },
      weeklyTrend,
      departmentWise: deptStats,
    });
  } catch (error) {
    console.error("Manager dashboard error:", error);
    res.status(500).json({ message: "Server error in manager dashboard" });
  }
};

module.exports = { getEmployeeDashboard, getManagerDashboard };
