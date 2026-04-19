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
      if (role === "admin") navigate("/admin");
      else if (role === "student") navigate("/student");
    }
  }, [navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-10 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            x: [0, -10, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, -15, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
          className="absolute top-1/2 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl"
        />
      </div>

      {!showLogin ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative z-10"
        >
          {/* Main Content */}
          <motion.div
            variants={itemVariants}
            className="text-center max-w-4xl mb-8"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <span className="text-6xl md:text-7xl">🎯</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-black gradient-text mb-6 leading-tight">
              Smart Attendance
              <br />
              with AI
            </h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-slate-400 mb-4 max-w-2xl mx-auto leading-relaxed"
            >
              Experience the future of attendance tracking. Real-time face
              recognition technology for seamless, secure, and efficient
              attendance management.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4 justify-center mb-12 text-sm md:text-base"
            >
              <div className="glass px-6 py-3 rounded-full">
                <span className="text-cyan-400 font-semibold">
                  ✨ AI-Powered
                </span>
              </div>
              <div className="glass px-6 py-3 rounded-full">
                <span className="text-blue-400 font-semibold">🔒 Secure</span>
              </div>
              <div className="glass px-6 py-3 rounded-full">
                <span className="text-violet-400 font-semibold">
                  ⚡ Real-time
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* CTA Button */}
          <motion.button
            variants={itemVariants}
            onClick={() => setShowLogin(true)}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="btn-glow relative px-8 py-4 text-lg font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 rounded-lg shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300"
          >
            Get Started
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="ml-2"
            >
              →
            </motion.span>
          </motion.button>

          {/* Features Grid */}
          <motion.div
            variants={itemVariants}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full"
          >
            {[
              {
                icon: "👤",
                title: "For Students",
                desc: "Track your attendance and view your profile",
              },
              {
                icon: "👨‍💼",
                title: "For Faculty",
                desc: "Manage students and mark attendance instantly",
              },
              {
                icon: "📊",
                title: "Analytics",
                desc: "Real-time reports and attendance insights",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="glass p-6 rounded-xl border border-cyan-500/20 hover:border-cyan-400/40 transition-all"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-bold text-cyan-400 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div
            key="login-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10"
          >
            <motion.button
              onClick={() => setShowLogin(false)}
              whileHover={{ scale: 1.1 }}
              className="absolute top-24 left-4 md:left-8 text-slate-400 hover:text-cyan-400 transition"
            >
              ← Back
            </motion.button>
            <div className="w-full max-w-md">
              <Login />
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
