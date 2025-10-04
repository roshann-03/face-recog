import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login.jsx";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (token && role) {
      // Redirect based on role
      if (role === "admin") navigate("/admin");
      else if (role === "student") navigate("/student");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 to-indigo-200 flex flex-col items-center justify-center px-4 py-12">
      {!showLogin ? (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-900 mb-6">
            Welcome to Face Recognition Attendance
          </h1>
          <p className="text-indigo-800 mb-12 text-lg md:text-xl">
            Track attendance easily with face recognition. Faculty can manage
            students, mark attendance, and view reports. Students can view their
            profile and attendance history.
          </p>

          <motion.button
            onClick={() => setShowLogin(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-indigo-600 text-white px-8 py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition-all duration-300 text-lg font-semibold"
          >
            Login
          </motion.button>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div
            key="login-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mt-6 bg-white rounded-xl shadow-lg p-6"
          >
            <Login />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
