import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole"); // "admin" or "student"

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Role-based menu items
  const menuItems = token
    ? role === "admin"
      ? [
          { label: "Attendance", to: "/admin/attendance" },
          { label: "Students", to: "/admin/students" },
          { label: "Queries", to: "/admin/queries" },
        ]
      : [{ label: "My Attendance", to: "/student/attendance" }]
    : [{ label: "Contact", to: "/contact" }];

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold hover:text-indigo-200 transition"
          >
            MyApp
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/" className="hover:text-indigo-200 transition">
              Home
            </Link>
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="hover:text-indigo-200 transition"
              >
                {item.label}
              </Link>
            ))}

            {token ? (
              <button
                onClick={handleLogout}
                className="bg-white text-indigo-600 px-3 py-1 rounded hover:bg-gray-100 transition"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-white text-indigo-600 px-3 py-1 rounded hover:bg-gray-100 transition"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none focus:ring-2 focus:ring-white p-1 rounded"
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
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-indigo-700 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block hover:text-indigo-200 transition"
          >
            Home
          </Link>

          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className="block hover:text-indigo-200 transition"
            >
              {item.label}
            </Link>
          ))}

          {token ? (
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-full text-left bg-white text-indigo-600 px-3 py-1 rounded hover:bg-gray-100 transition"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block bg-white text-indigo-600 px-3 py-1 rounded hover:bg-gray-100 transition"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
