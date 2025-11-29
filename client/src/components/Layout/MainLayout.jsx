// src/components/Layout/MainLayout.jsx
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

const MainLayout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <header
        style={{
          padding: "10px 20px",
          background: "#111827",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: "18px" }}>Employee Attendance System</h1>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {user && (
            <>
              <span>
                {user.name} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                style={{
                  border: "none",
                  padding: "6px 12px",
                  cursor: "pointer",
                  borderRadius: "4px",
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </header>
      <main style={{ padding: "20px" }}>{children}</main>
    </div>
  );
};

export default MainLayout;
