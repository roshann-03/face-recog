import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Students from "./pages/Students.jsx";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import NotFound from "./pages/NotFound.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ContactForm from "./pages/ContactForm.jsx"; // ✅ Student contact form
import AdminQueries from "./pages/AdminQueries.jsx"; // ✅ Admin queries list
import { Toaster } from "react-hot-toast";
import AllStudents from "./pages/AllStudents.jsx";
import StudentDetail from "./pages/StudentDetail.jsx";
import EditStudent from "./pages/EditStudent.jsx";
import AdminAttendance from "./pages/AdminAttendance.jsx";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Admin-only routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students/new"
          element={
            <ProtectedRoute role="admin">
              <Students />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/queries"
          element={
            <ProtectedRoute role="admin">
              <AdminQueries />
            </ProtectedRoute>
          }
        />
        {/* Student-only routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact"
          element={
            // <ProtectedRoute role="student">
            <ContactForm />
            // </ProtectedRoute>
          }
        />
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute role="admin">
              <AllStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students/:id"
          element={
            <ProtectedRoute role="admin">
              <StudentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students/edit/:id"
          element={
            <ProtectedRoute role="admin">
              <EditStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute role="admin">
              <AdminAttendance />
            </ProtectedRoute>
          }
        />
        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
