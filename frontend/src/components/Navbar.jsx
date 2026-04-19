import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    setIsOpen(false);
  };

  const menuItems = token
    ? role === "admin"
      ? [
          { label: "📊 Attendance", to: "/admin/attendance" },
          { label: "👥 Students", to: "/admin/students" },
          { label: "💬 Queries", to: "/admin/queries" },
        ]
      : [{ label: "📋 My Attendance", to: "/student/attendance" }]
    : [{ label: "✉️ Contact", to: "/contact" }];

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.nav
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className="sticky top-0 z-50 glass border-b border-cyan-500/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="relative group">
            <span className="text-2xl font-bold gradient-text">
              🎯 FaceAttend
            </span>
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link
              to="/"
              className="text-slate-300 hover:text-cyan-400 font-medium transition-colors duration-200"
            >
              Home
            </Link>
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-slate-300 hover:text-cyan-400 font-medium transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}

            {token ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="btn-glow bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-lg hover:from-red-600 hover:to-red-700 font-medium shadow-lg"
              >
                Logout
              </motion.button>
            ) : (
              <Link to="/login">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-glow bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 px-6 py-2 rounded-lg hover:from-cyan-300 hover:to-blue-400 font-bold shadow-lg"
                >
                  Login
                </motion.div>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="focus:outline-none p-2 rounded-lg text-cyan-400"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="md:hidden overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-slate-300 hover:text-cyan-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                >
                  Home
                </Link>
                {menuItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-slate-300 hover:text-cyan-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="pt-2 border-t border-slate-700">
                  {token ? (
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-medium transition-all duration-200"
                    >
                      Logout
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 rounded-lg hover:from-cyan-300 hover:to-blue-400 font-bold text-center transition-all duration-200"
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
