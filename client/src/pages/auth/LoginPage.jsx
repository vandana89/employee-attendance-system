// src/pages/auth/LoginPage.jsx
import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ hooks must be inside the component
  const { user, token } = useSelector((state) => state.auth);

  // If already logged in, redirect to correct dashboard
  useEffect(() => {
    if (token && user) {
      if (user.role === "manager") {
        navigate("/manager/dashboard");
      } else {
        navigate("/employee/dashboard");
      }
    }
  }, [token, user, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axiosClient.post("/auth/login", form);

      const { token, ...userData } = res.data;

      // Save in Redux + localStorage
      dispatch(setCredentials({ user: userData, token }));

      // Redirect based on role
      if (userData.role === "manager") {
        navigate("/manager/dashboard");
      } else {
        navigate("/employee/dashboard");
      }
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
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
          width: "320px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginBottom: "16px", textAlign: "center" }}>Login</h2>

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

        <div style={{ marginBottom: "12px" }}>
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

        <div style={{ marginBottom: "16px" }}>
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
          {loading ? "Logging in..." : "Login"}
        </button>

        <p
          style={{
            marginTop: "10px",
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          Don&apos;t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            style={{ color: "#2563eb", cursor: "pointer" }}
          >
            Register
          </span>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
