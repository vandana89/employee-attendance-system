// src/pages/manager/ManagerDashboard.jsx
import { useEffect, useState } from "react";
import MainLayout from "../../components/Layout/MainLayout";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

const ManagerDashboard = () => {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosClient.get("/dashboard/manager");
      setData(res.data);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message || "Failed to load manager dashboard data.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <MainLayout>
      <h2 style={{ marginBottom: "12px" }}>Manager Dashboard</h2>

      {/* Quick navigation buttons */}
      <div style={{ marginBottom: "16px", display: "flex", gap: "8px" }}>
        <button
          onClick={() => navigate("/manager/attendance")}
          style={{
            padding: "6px 12px",
            borderRadius: "4px",
            border: "none",
            background: "#2563eb",
            color: "white",
            cursor: "pointer",
          }}
        >
          View All Attendance
        </button>
        <button
          onClick={() => navigate("/manager/reports")}
          style={{
            padding: "6px 12px",
            borderRadius: "4px",
            border: "none",
            background: "#059669",
            color: "white",
            cursor: "pointer",
          }}
        >
          Reports & CSV Export
        </button>
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
        <p>Loading dashboard...</p>
      ) : !data ? (
        <p>No data available.</p>
      ) : (
        <>
          {/* Top stats cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <StatCard label="Total Employees" value={data.totalEmployees} />
            <StatCard
              label="Present Today"
              value={data.today?.present ?? 0}
              color="#16a34a"
            />
            <StatCard
              label="Absent Today"
              value={data.today?.absent ?? 0}
              color="#dc2626"
            />
          </div>

          {/* Two-column section: Today details & Weekly trend */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.5fr",
              gap: "16px",
              marginBottom: "20px",
              alignItems: "flex-start",
            }}
          >
            {/* Today details */}
            <div
              style={{
                background: "white",
                padding: "16px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <h3 style={{ marginBottom: "8px" }}>Today&apos;s Details</h3>

              {/* Late arrivals */}
              <div style={{ marginBottom: "12px" }}>
                <h4 style={{ fontSize: "14px", marginBottom: "4px" }}>
                  Late Arrivals
                </h4>
                {data.today?.lateArrivals?.length ? (
                  <ul style={{ fontSize: "13px", paddingLeft: "18px" }}>
                    {data.today.lateArrivals.map((r) => (
                      <li key={r._id}>
                        {r.user?.name} ({r.user?.employeeId}) –{" "}
                        {r.user?.department || "-"}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: "13px" }}>No late arrivals today.</p>
                )}
              </div>

              {/* Absent employees */}
              <div>
                <h4 style={{ fontSize: "14px", marginBottom: "4px" }}>
                  Absent Employees
                </h4>
                {data.today?.absentEmployees?.length ? (
                  <ul style={{ fontSize: "13px", paddingLeft: "18px" }}>
                    {data.today.absentEmployees.map((r) => (
                      <li key={r._id}>
                        {r.user?.name} ({r.user?.employeeId}) –{" "}
                        {r.user?.department || "-"}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: "13px" }}>No absent employees today.</p>
                )}
              </div>
            </div>

            {/* Weekly trend */}
            <div
              style={{
                background: "white",
                padding: "16px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <h3 style={{ marginBottom: "8px" }}>Weekly Attendance Trend</h3>
              {data.weeklyTrend && Object.keys(data.weeklyTrend).length ? (
                <ul style={{ fontSize: "13px", paddingLeft: "18px" }}>
                  {Object.entries(data.weeklyTrend)
                    .sort(([d1], [d2]) => (d1 < d2 ? -1 : 1))
                    .map(([date, count]) => (
                      <li key={date}>
                        {date}: {count} present/late/half-day
                      </li>
                    ))}
                </ul>
              ) : (
                <p style={{ fontSize: "13px" }}>
                  Not enough data yet for weekly trend.
                </p>
              )}
            </div>
          </div>

          {/* Department-wise attendance */}
          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            <h3>Department-wise Attendance (Today)</h3>
            {data.departmentWise &&
            Object.keys(data.departmentWise).length > 0 ? (
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
                    <th style={thStyle}>Department</th>
                    <th style={thStyle}>Present</th>
                    <th style={thStyle}>Absent</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.departmentWise).map(([dep, stats]) => (
                    <tr key={dep}>
                      <td style={tdStyle}>{dep}</td>
                      <td style={tdStyle}>{stats.present ?? 0}</td>
                      <td style={tdStyle}>{stats.absent ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ marginTop: "8px", fontSize: "13px" }}>
                No department-wise data yet.
              </p>
            )}
          </div>
        </>
      )}
    </MainLayout>
  );
};

const StatCard = ({ label, value, color }) => (
  <div
    style={{
      background: "white",
      padding: "14px",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      borderLeft: `4px solid ${color || "#4b5563"}`,
    }}
  >
    <div style={{ fontSize: "12px", color: "#6b7280" }}>{label}</div>
    <div style={{ fontSize: "20px", fontWeight: "bold", marginTop: "4px" }}>
      {value}
    </div>
  </div>
);

const thStyle = {
  textAlign: "left",
  borderBottom: "1px solid #e5e7eb",
  padding: "8px",
};

const tdStyle = {
  borderBottom: "1px solid #f3f4f6",
  padding: "8px",
};

export default ManagerDashboard;
