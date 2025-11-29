// controllers/attendanceController.js
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const { getTodayDateString } = require("../utils/dateUtils");
const { generateCSV } = require("../utils/csvUtils");

// -------- Helper: status based on check-in ----------
const getStatusForCheckIn = (checkInDate) => {
  const officeStart = process.env.DEFAULT_OFFICE_START || "09:30";
  const [h, m] = officeStart.split(":").map(Number);
  const officeStartDate = new Date(checkInDate);
  officeStartDate.setHours(h, m, 0, 0);

  const diffMinutes = (checkInDate - officeStartDate) / (1000 * 60);

  if (diffMinutes <= 5) return "present";
  if (diffMinutes <= 60) return "late";
  return "half-day";
};

// ================= EMPLOYEE FUNCTIONS =================

/**
 * POST /api/attendance/checkin
 */
const checkIn = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = getTodayDateString();

    let attendance = await Attendance.findOne({ user: userId, date: today });

    if (attendance && attendance.checkInTime) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    const now = new Date();
    const status = getStatusForCheckIn(now);

    if (!attendance) {
      attendance = await Attendance.create({
        user: userId,
        date: today,
        checkInTime: now,
        status,
      });
    } else {
      attendance.checkInTime = now;
      attendance.status = status;
      await attendance.save();
    }

    res.status(200).json({
      message: "Check-in successful",
      attendance,
    });
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({ message: "Server error during check-in" });
  }
};

/**
 * POST /api/attendance/checkout
 */
const checkOut = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = getTodayDateString();

    const attendance = await Attendance.findOne({ user: userId, date: today });

    if (!attendance || !attendance.checkInTime) {
      return res
        .status(400)
        .json({ message: "You have not checked in today" });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ message: "Already checked out today" });
    }

    const now = new Date();
    attendance.checkOutTime = now;

    const diffMs = now - attendance.checkInTime;
    const hours = diffMs / (1000 * 60 * 60);
    attendance.totalHours = Math.round(hours * 100) / 100;

    await attendance.save();

    res.json({
      message: "Check-out successful",
      attendance,
    });
  } catch (error) {
    console.error("Check-out error:", error);
    res.status(500).json({ message: "Server error during check-out" });
  }
};

/**
 * GET /api/attendance/my-history?month=YYYY-MM
 */
const getMyHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { month } = req.query;

    const filter = { user: userId };

    if (month) {
      filter.date = { $regex: `^${month}` };
    }

    const records = await Attendance.find(filter).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    console.error("My history error:", error);
    res.status(500).json({ message: "Server error fetching history" });
  }
};

/**
 * GET /api/attendance/my-summary?month=YYYY-MM
 */
const getMySummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const { month } = req.query;

    const filter = { user: userId };

    if (month) {
      filter.date = { $regex: `^${month}` };
    }

    const records = await Attendance.find(filter);

    let present = 0;
    let late = 0;
    let halfDay = 0;
    let absent = 0;
    let totalHours = 0;

    records.forEach((r) => {
      if (r.status === "present") present++;
      else if (r.status === "late") late++;
      else if (r.status === "half-day") halfDay++;
      else if (r.status === "absent") absent++;

      totalHours += r.totalHours || 0;
    });

    res.json({
      present,
      late,
      halfDay,
      absent,
      totalHours: Math.round(totalHours * 100) / 100,
      totalDays: records.length,
    });
  } catch (error) {
    console.error("My summary error:", error);
    res.status(500).json({ message: "Server error fetching summary" });
  }
};

/**
 * GET /api/attendance/today
 */
const getTodayStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = getTodayDateString();

    const attendance = await Attendance.findOne({ user: userId, date: today });

    if (!attendance) {
      return res.json({ message: "No attendance record for today" });
    }

    res.json(attendance);
  } catch (error) {
    console.error("Today status error:", error);
    res.status(500).json({ message: "Server error fetching today status" });
  }
};

// ================= MANAGER FUNCTIONS =================

/**
 * GET /api/attendance/report
 * Query: startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&employeeId=EMP001 (optional)
 */
const getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    const filter = {};

    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }

    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (!user) {
        return res.json([]); // no records if employee not found
      }
      filter.user = user._id;
    }

    const records = await Attendance.find(filter).populate(
      "user",
      "name email employeeId department"
    );

    res.json(records);
  } catch (error) {
    console.error("Attendance report error:", error);
    res
      .status(500)
      .json({ message: "Server error fetching attendance report" });
  }
};

/**
 * GET /api/attendance/all
 * Query params: ?date=YYYY-MM-DD&status=present&employeeId=EMP001
 */
const getAllAttendance = async (req, res) => {
  try {
    const { date, status, employeeId } = req.query;
    const filter = {};

    if (date) filter.date = date;
    if (status) filter.status = status;

    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (!user) {
        return res.json([]);
      }
      filter.user = user._id;
    }

    const records = await Attendance.find(filter).populate(
      "user",
      "name email employeeId department role"
    );

    res.json(records);
  } catch (error) {
    console.error("All attendance error:", error);
    res.status(500).json({ message: "Server error fetching attendance" });
  }
};

/**
 * GET /api/attendance/employee/:id
 */
const getEmployeeAttendance = async (req, res) => {
  try {
    const userId = req.params.id;

    const records = await Attendance.find({ user: userId }).sort({ date: -1 });

    res.json(records);
  } catch (error) {
    console.error("Employee attendance error:", error);
    res
      .status(500)
      .json({ message: "Server error fetching employee attendance" });
  }
};

/**
 * GET /api/attendance/summary
 * Returns team summary + department-wise breakdown
 */
const getTeamSummary = async (req, res) => {
  try {
    const records = await Attendance.find().populate("user", "department");

    const summary = {
      totalRecords: records.length,
      present: 0,
      late: 0,
      halfDay: 0,
      absent: 0,
      departmentWise: {},
    };

    records.forEach((r) => {
      // Increment overall status counts
      if (r.status === "present") summary.present++;
      else if (r.status === "late") summary.late++;
      else if (r.status === "half-day") summary.halfDay++;
      else if (r.status === "absent") summary.absent++;

      const dep = r.user?.department || "Unknown";
      if (!summary.departmentWise[dep]) {
        summary.departmentWise[dep] = {
          present: 0,
          late: 0,
          halfDay: 0,
          absent: 0,
        };
      }

      if (r.status === "present") summary.departmentWise[dep].present++;
      else if (r.status === "late") summary.departmentWise[dep].late++;
      else if (r.status === "half-day") summary.departmentWise[dep].halfDay++;
      else if (r.status === "absent") summary.departmentWise[dep].absent++;
    });

    res.json(summary);
  } catch (error) {
    console.error("Team summary error:", error);
    res.status(500).json({ message: "Server error fetching team summary" });
  }
};

/**
 * GET /api/attendance/export?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&employeeId=EMP001
 */
const exportAttendanceCSV = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    const filter = {};

    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }

    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (!user) {
        return res.status(200).send(""); // empty CSV
      }
      filter.user = user._id;
    }

    const records = await Attendance.find(filter).populate(
      "user",
      "name email employeeId department"
    );

    const data = records.map((r) => ({
      employeeId: r.user.employeeId,
      name: r.user.name,
      email: r.user.email,
      department: r.user.department,
      date: r.date,
      status: r.status,
      checkInTime: r.checkInTime,
      checkOutTime: r.checkOutTime,
      totalHours: r.totalHours,
    }));

    const fields = [
      "employeeId",
      "name",
      "email",
      "department",
      "date",
      "status",
      "checkInTime",
      "checkOutTime",
      "totalHours",
    ];

    const csv = generateCSV(data, fields);

    res.header("Content-Type", "text/csv");
    res.attachment("attendance_report.csv");
    return res.send(csv);
  } catch (error) {
    console.error("Export CSV error:", error);
    res.status(500).json({ message: "Server error exporting CSV" });
  }
};

/**
 * GET /api/attendance/today-status
 * Who is present/absent today (team)
 */
const getTodayTeamStatus = async (req, res) => {
  try {
    const today = getTodayDateString();

    const records = await Attendance.find({ date: today }).populate(
      "user",
      "name email employeeId department"
    );

    const present = records.filter((r) =>
      ["present", "late", "half-day"].includes(r.status)
    );
    const absent = records.filter((r) => r.status === "absent");

    res.json({
      totalRecords: records.length,
      present,
      absent,
    });
  } catch (error) {
    console.error("Today team status error:", error);
    res
      .status(500)
      .json({ message: "Server error fetching today team status" });
  }
};

module.exports = {
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
  getAttendanceReport, // ✅ new
};
