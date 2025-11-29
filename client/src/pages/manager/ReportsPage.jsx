// src/pages/manager/ReportsPage.jsx
import { useState } from "react";
import MainLayout from "../../components/Layout/MainLayout";
import axiosClient from "../../api/axiosClient";

const ReportsPage = () => {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    employeeId: "",
  });

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exportLoading, setExportLoading] = useState(false);

  const handleChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");
    setRecords([]);

    const { startDate, endDate, employeeId } = filters;

    if (!startDate || !endDate) {
      setError("Please select both start date and end date.");
      return;
    }

    try {
      setLoading(true);
      const params = { startDate, endDate };
      if (employeeId.trim()) params.employeeId = employeeId.trim();

      const res = await axiosClient.get("/attendance/report", { params });
      setRecords(res.data || []);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        "Failed to generate report. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setError("");
    const { startDate, endDate, employeeId } = filters;

    if (!startDate || !endDate) {
      setError("Please select both start date and end date for export.");
      return;
    }

    try {
      setExportLoading(true);
      const params = { startDate, endDate };
      if (employeeId.trim()) params.employeeId = employeeId.trim();

      const res = await axiosClient.get("/attendance/export", {
        params,
        responseType: "blob", // CSV file
      });

      // Create download link
      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "attendance_report.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message || "Failed to export CSV. Please try again.";
      setError(msg);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <MainLayout>
      <h2 style={{ marginBottom: "12px" }}>Attendance Reports</h2>

      {/* Filters form */}
      <form
        onSubmit={handleGenerate}
        style={{
          background: "white",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          marginBottom: "16px",
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "flex-end",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", minWidth: "160px" }}>
          <label style={{ fontSize: "13px" }}>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleChange}
            style={{ padding: "6px 8px" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", minWidth: "160px" }}>
          <label style={{ fontSize: "13px" }}>End Date</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleChange}
            style={{ padding: "6px 8px" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", minWidth: "160px" }}>
          <label style={{ fontSize: "13px" }}>Employee ID (optional)</label>
          <input
            name="employeeId"
            value={filters.employeeId}
            onChange={handleChange}
            placeholder="e.g. EMP001"
            style={{ padding: "6px 8px" }}
          />
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
          Generate Report
        </button>

        <button
          type="button"
          onClick={handleExport}
          disabled={exportLoading}
          style={{
            padding: "8px 14px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            background: exportLoading ? "#e5e7eb" : "white",
            cursor: exportLoading ? "not-allowed" : "pointer",
          }}
        >
          {exportLoading ? "Exporting..." : "Export CSV"}
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
        <h3>Report Results</h3>
        {loading ? (
          <p style={{ marginTop: "10px" }}>Loading...</p>
        ) : records.length === 0 ? (
          <p style={{ marginTop: "10px" }}>No records found for selected range.</p>
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

export default ReportsPage;
