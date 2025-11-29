// src/pages/employee/EmployeeDashboard.jsx
import { useEffect, useState } from "react";
import MainLayout from "../../components/Layout/MainLayout";
import axiosClient from "../../api/axiosClient";

const EmployeeDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosClient.get("/dashboard/employee");
      setDashboard(res.data);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message || "Failed to load dashboard data.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setError("");
      await axiosClient.post("/attendance/checkin");
      await fetchDashboard(); // refresh stats after success
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message || "Failed to check in. Try again.";
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setError("");
      await axiosClient.post("/attendance/checkout");
      await fetchDashboard(); // refresh stats after success
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message || "Failed to check out. Try again.";
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const getTodayLabel = () => {
    if (!dashboard || !dashboard.todayStatus) {
      return "Not checked in";
    }
    const status = dashboard.todayStatus.status;
    if (!dashboard.todayStatus.checkInTime) return "Not checked in";
    if (dashboard.todayStatus.checkInTime && !dashboard.todayStatus.checkOutTime)
      return `Checked in (${status})`;
    return `Checked out (${status})`;
  };

  return (
    <MainLayout>
      <h2 style={{ marginBottom: "16px" }}>Employee Dashboard</h2>

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
        <p>Loading dashboard...</p>
      ) : (
        dashboard && (
          <>
            {/* Top row: Today status + Check In/Out buttons */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  background: "white",
                  padding: "16px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <h3>Today&apos;s Status</h3>
                <p style={{ fontSize: "18px", marginTop: "8px" }}>
                  {getTodayLabel()}
                </p>
                {dashboard.todayStatus && (
                  <p style={{ fontSize: "12px", marginTop: "4px" }}>
                    Date: {dashboard.todayStatus.date}
                  </p>
                )}
              </div>

              <div
                style={{
                  background: "white",
                  padding: "16px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <button
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                  style={{
                    padding: "10px",
                    border: "none",
                    borderRadius: "6px",
                    background: "#16a34a",
                    color: "white",
                    cursor: actionLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {actionLoading ? "Please wait..." : "Check In"}
                </button>
                <button
                  onClick={handleCheckOut}
                  disabled={actionLoading}
                  style={{
                    padding: "10px",
                    border: "none",
                    borderRadius: "6px",
                    background: "#dc2626",
                    color: "white",
                    cursor: actionLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {actionLoading ? "Please wait..." : "Check Out"}
                </button>
              </div>
            </div>

            {/* Monthly summary */}
            <div
              style={{
                background: "white",
                padding: "16px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                marginBottom: "20px",
              }}
            >
              <h3>This Month Summary</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "12px",
                  marginTop: "12px",
                }}
              >
                <SummaryCard
                  label="Present"
                  value={dashboard.monthlySummary.present}
                  color="#16a34a"
                />
                <SummaryCard
                  label="Absent"
                  value={dashboard.monthlySummary.absent}
                  color="#dc2626"
                />
                <SummaryCard
                  label="Late"
                  value={dashboard.monthlySummary.late}
                  color="#eab308"
                />
                <SummaryCard
                  label="Half-Day"
                  value={dashboard.monthlySummary.halfDay}
                  color="#fb923c"
                />
              </div>
              <p style={{ marginTop: "12px" }}>
                <strong>Total Hours:</strong>{" "}
                {dashboard.monthlySummary.totalHours} hrs
              </p>
            </div>

            {/* Recent attendance */}
            <div
              style={{
                background: "white",
                padding: "16px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <h3>Recent Attendance (Last 7 days)</h3>
              {dashboard.recentAttendance.length === 0 ? (
                <p style={{ marginTop: "10px" }}>No records yet.</p>
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
                    {dashboard.recentAttendance.map((item) => (
                      <tr key={item._id}>
                        <td style={tdStyle}>{item.date}</td>
                        <td style={tdStyle}>{item.status}</td>
                        <td style={tdStyle}>
                          {item.totalHours ? item.totalHours.toFixed(2) : "0.00"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )
      )}
    </MainLayout>
  );
};

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

export default EmployeeDashboard;
