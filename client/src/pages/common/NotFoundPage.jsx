// src/pages/common/NotFoundPage.jsx
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#e5e7eb",
      }}
    >
      <h1>404 - Page Not Found</h1>
      <Link to="/login" style={{ marginTop: "10px", color: "#1d4ed8" }}>
        Go to Login
      </Link>
    </div>
  );
};

export default NotFoundPage;
