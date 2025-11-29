// src/pages/manager/AllAttendancePage.jsx
import { useEffect, useState } from "react";
import MainLayout from "../../components/Layout/MainLayout";
import axiosClient from "../../api/axiosClient";

const AllAttendancePage = () => {
  const [filters, setFilters] = useState({
    date: "",
    status: "",
    employeeId: "",
  });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (filters.date) params.date = filters.date;
      if (filters.status) params.status = filters.status;
      if (filters.employeeId.trim()) params.employeeId = filters.employeeId.trim();

      const res = await axiosClient.get("/attendance/all", { params });
      setRecords(res.data || []);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        "Failed to load attendance records. (Manager only)";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchAttendance();
  };

  const handleClear = () => {
    setFilters({ date: "", status: "", employeeId: "" });
    fetchAttendance();
  };

  return (
    <MainLayout>
      <h2 style={{ marginBottom: "12px" }}>All Employees Attendance</h2>

      {/* Filters */}
      <form
        onSubmit={handleFilter}
        style={{
          background: "white",
          padding: "12px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          marginBottom: "16px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", minWidth: "150px" }}>
          <label style={{ fontSize: "13px" }}>Employee ID</label>
          <input
            name="employeeId"
            value={filters.employeeId}
            onChange={handleChange}
            placeholder="e.g. EMP001"
            style={{ padding: "6px 8px" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", minWidth: "150px" }}>
          <label style={{ fontSize: "13px" }}>Date</label>
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleChange}
            style={{ padding: "6px 8px" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", minWidth: "150px" }}>
          <label style={{ fontSize: "13px" }}>Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            style={{ padding: "6px 8px" }}
          >
            <option value="">All</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="half-day">Half-Day</option>
            <option value="absent">Absent</option>
          </select>
        </div>

        <button
          type="submit"
          style={{
            padding: "8px 14px",
            borderRadius: "6px",
            border: "none",
            background: "#111827",
            color: "white",
            cursor: "pointer",
          }}
        >
          Apply Filters
        </button>

        <button
          type="button"
          onClick={handleClear}
          style={{
            padding: "8px 14px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            background: "white",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </form>

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

      {/* Table */}
      <div
        style={{
          background: "white",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <h3>Attendance Records</h3>
        {loading ? (
          <p style={{ marginTop: "10px" }}>Loading...</p>
        ) : records.length === 0 ? (
          <p style={{ marginTop: "10px" }}>No records found.</p>
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
                <th style={thStyle}>Employee ID</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Department</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id}>
                  <td style={tdStyle}>{r.date}</td>
                  <td style={tdStyle}>{r.user?.employeeId}</td>
                  <td style={tdStyle}>{r.user?.name}</td>
                  <td style={tdStyle}>{r.user?.department || "-"}</td>
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

export default AllAttendancePage;
