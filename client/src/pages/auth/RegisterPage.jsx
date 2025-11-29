// src/pages/auth/RegisterPage.jsx
import { useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    employeeId: "",
    department: "",
    role: "employee", // default
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      await axiosClient.post("/auth/register", form);

      setSuccessMsg("Registration successful! You can now login.");
      // Optionally redirect after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#e5e7eb",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "24px",
          borderRadius: "8px",
          width: "380px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginBottom: "16px", textAlign: "center" }}>Register</h2>

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

        {successMsg && (
          <div
            style={{
              background: "#dcfce7",
              color: "#15803d",
              padding: "8px",
              marginBottom: "12px",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            {successMsg}
          </div>
        )}

        <div style={{ marginBottom: "10px" }}>
          <label>Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Employee ID</label>
          <input
            name="employeeId"
            value={form.employeeId}
            onChange={handleChange}
            required
            placeholder="e.g. EMP003"
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Department</label>
          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            required
            placeholder="e.g. Engineering"
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label>Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            border: "none",
            background: loading ? "#6b7280" : "#111827",
            color: "white",
            cursor: loading ? "not-allowed" : "pointer",
            borderRadius: "4px",
          }}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p
          style={{
            marginTop: "10px",
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ color: "#2563eb", cursor: "pointer" }}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
