// src/pages/employee/AttendanceHistoryPage.jsx
import { useEffect, useState } from "react";
import MainLayout from "../../components/Layout/MainLayout";
import axiosClient from "../../api/axiosClient";

const AttendanceHistoryPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // "YYYY-MM"
  );
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchData = async (month) => {
    try {
      setLoading(true);
      setError("");
      // history
      const [historyRes, summaryRes] = await Promise.all([
        axiosClient.get(`/attendance/my-history?month=${month}`),
        axiosClient.get(`/attendance/my-summary?month=${month}`),
      ]);

      setRecords(historyRes.data || []);
      setSummary(summaryRes.data || null);
      setSelectedDate(null);
      setSelectedRecord(null);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message || "Failed to load attendance data.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedMonth);
  }, [selectedMonth]);

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value); // "YYYY-MM"
  };

  // Map date -> record for quick lookup
  const attendanceMap = records.reduce((acc, rec) => {
    acc[rec.date] = rec;
    return acc;
  }, {});

  const handleDateClick = (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedRecord(attendanceMap[dateStr] || null);
  };

  const { year, monthIndex, daysInMonth, firstWeekday } =
    getMonthMeta(selectedMonth);

  const calendarCells = buildCalendarCells(
    year,
    monthIndex,
    daysInMonth,
    firstWeekday
  );

  return (
    <MainLayout>
      <h2 style={{ marginBottom: "12px" }}>My Attendance History</h2>

      {/* Month filter */}
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <label>
          Select Month:{" "}
          <input
            type="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            style={{ padding: "4px 8px" }}
          />
        </label>
      </div>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            padding: "8px",
            marginBottom: "12px",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Summary cards */}
          {summary && (
            <div
              style={{
                background: "white",
                padding: "16px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                marginBottom: "20px",
              }}
            >
              <h3>Summary for {selectedMonth}</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "12px",
                  marginTop: "12px",
                }}
              >
                <SummaryCard label="Present" value={summary.present} color="#16a34a" />
                <SummaryCard label="Absent" value={summary.absent} color="#dc2626" />
                <SummaryCard label="Late" value={summary.late} color="#eab308" />
                <SummaryCard
                  label="Half-Day"
                  value={summary.halfDay}
                  color="#fb923c"
                />
              </div>
              <p style={{ marginTop: "12px" }}>
                <strong>Total Hours:</strong> {summary.totalHours} hrs
              </p>
            </div>
          )}

          {/* Calendar + details */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "16px",
              alignItems: "flex-start",
              marginBottom: "20px",
            }}
          >
            {/* Calendar */}
            <div
              style={{
                background: "white",
                padding: "16px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ marginBottom: "8px" }}>Calendar View</h3>

              {/* Legend */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  fontSize: "12px",
                  marginBottom: "10px",
                  flexWrap: "wrap",
                }}
              >
                <LegendItem color="#bbf7d0" label="Present" />
                <LegendItem color="#fecaca" label="Absent" />
                <LegendItem color="#fef9c3" label="Late" />
                <LegendItem color="#fed7aa" label="Half-Day" />
                <LegendItem color="#e5e7eb" label="No Record" />
              </div>

              {/* Weekday headers */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  textAlign: "center",
                  fontSize: "12px",
                  marginBottom: "4px",
                  color: "#6b7280",
                }}
              >
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: "4px",
                }}
              >
                {calendarCells.map((cell, idx) => {
                  if (!cell) {
                    return <div key={idx} style={{ height: "48px" }} />;
                  }

                  const { day, fullDate } = cell;
                  const rec = attendanceMap[fullDate];
                  const bg = getStatusColor(rec?.status);
                  const isSelected = selectedDate === fullDate;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleDateClick(fullDate)}
                      style={{
                        height: "48px",
                        borderRadius: "6px",
                        border: isSelected
                          ? "2px solid #2563eb"
                          : "1px solid #e5e7eb",
                        background: bg,
                        cursor: "pointer",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected date details */}
            <div
              style={{
                background: "white",
                padding: "16px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                minHeight: "120px",
              }}
            >
              <h3 style={{ marginBottom: "8px" }}>Day Details</h3>
              {selectedDate ? (
                selectedRecord ? (
                  <div style={{ fontSize: "14px" }}>
                    <p>
                      <strong>Date:</strong> {selectedRecord.date}
                    </p>
                    <p>
                      <strong>Status:</strong> {selectedRecord.status}
                    </p>
                    <p>
                      <strong>Total Hours:</strong>{" "}
                      {selectedRecord.totalHours
                        ? selectedRecord.totalHours.toFixed(2)
                        : "0.00"}
                    </p>
                    <p style={{ fontSize: "12px", marginTop: "4px" }}>
                      Check In:{" "}
                      {selectedRecord.checkInTime
                        ? new Date(
                            selectedRecord.checkInTime
                          ).toLocaleTimeString()
                        : "-"}
                      <br />
                      Check Out:{" "}
                      {selectedRecord.checkOutTime
                        ? new Date(
                            selectedRecord.checkOutTime
                          ).toLocaleTimeString()
                        : "-"}
                    </p>
                  </div>
                ) : (
                  <p style={{ fontSize: "14px" }}>
                    No attendance record on <strong>{selectedDate}</strong>.
                  </p>
                )
              ) : (
                <p style={{ fontSize: "14px" }}>
                  Click on a date in the calendar to view details.
                </p>
              )}
            </div>
          </div>

          {/* Table view */}
          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h3>Attendance Records (Table)</h3>
            {records.length === 0 ? (
              <p style={{ marginTop: "10px" }}>No records for this month.</p>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: "10px",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Total Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr
                      key={r._id}
                      style={{
                        cursor: "pointer",
                        background:
                          selectedDate === r.date ? "#eff6ff" : "transparent",
                      }}
                      onClick={() => handleDateClick(r.date)}
                    >
                      <td style={tdStyle}>{r.date}</td>
                      <td style={tdStyle}>{r.status}</td>
                      <td style={tdStyle}>
                        {r.totalHours ? r.totalHours.toFixed(2) : "0.00"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </MainLayout>
  );
};

// Helpers & small components

const thStyle = {
  textAlign: "left",
  borderBottom: "1px solid #e5e7eb",
  padding: "8px",
};

const tdStyle = {
  borderBottom: "1px solid #f3f4f6",
  padding: "8px",
};

const SummaryCard = ({ label, value, color }) => (
  <div
    style={{
      background: "#f9fafb",
      borderRadius: "8px",
      padding: "10px",
      borderLeft: `4px solid ${color}`,
    }}
  >
    <div style={{ fontSize: "12px", color: "#6b7280" }}>{label}</div>
    <div style={{ fontSize: "18px", fontWeight: "bold" }}>{value}</div>
  </div>
);

const LegendItem = ({ color, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
    <span
      style={{
        width: "12px",
        height: "12px",
        borderRadius: "3px",
        background: color,
        border: "1px solid #d1d5db",
      }}
    />
    <span>{label}</span>
  </div>
);

const getStatusColor = (status) => {
  switch (status) {
    case "present":
      return "#bbf7d0"; // green-200
    case "absent":
      return "#fecaca"; // red-200
    case "late":
      return "#fef9c3"; // yellow-100
    case "half-day":
      return "#fed7aa"; // orange-200
    default:
      return "#e5e7eb"; // gray-200
  }
};

const getMonthMeta = (yearMonth) => {
  // yearMonth: "YYYY-MM"
  const [yearStr, monthStr] = yearMonth.split("-");
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthStr, 10) - 1; // 0-based

  const firstDay = new Date(year, monthIndex, 1);
  const firstWeekday = firstDay.getDay(); // 0=Sun..6=Sat
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  return { year, monthIndex, daysInMonth, firstWeekday };
};

const buildCalendarCells = (year, monthIndex, daysInMonth, firstWeekday) => {
  const cells = [];
  const month = (monthIndex + 1).toString().padStart(2, "0");

  // Empty cells before 1st of month
  for (let i = 0; i < firstWeekday; i++) {
    cells.push(null);
  }

  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = day.toString().padStart(2, "0");
    const fullDate = `${year}-${month}-${dayStr}`;
    cells.push({ day, fullDate });
  }

  return cells;
};

export default AttendanceHistoryPage;
