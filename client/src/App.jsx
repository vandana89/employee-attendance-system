// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import NotFoundPage from "./pages/common/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AttendanceHistoryPage from "./pages/employee/AttendanceHistoryPage";
import AllAttendancePage from "./pages/manager/AllAttendancePage";
import ReportsPage from "./pages/manager/ReportsPage";




function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Employee protected routes */}
      <Route element={<ProtectedRoute allowedRoles={["employee"]} />}>
  <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
  <Route path="/employee/history" element={<AttendanceHistoryPage />} />
</Route>


      {/* Manager protected routes */}
      <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
  <Route path="/manager/dashboard" element={<ManagerDashboard />} />
  <Route path="/manager/attendance" element={<AllAttendancePage />} />
   <Route path="/manager/reports" element={<ReportsPage />} />
</Route>


      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
