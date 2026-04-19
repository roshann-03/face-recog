import { useState } from "react";
import { API_ONE } from "../api/api.js";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await API_ONE.post("/forgot-password", { email });
      setEmail("");
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass border border-cyan-500/20 rounded-3xl p-8 shadow-2xl">
          <motion.h2
            className="text-3xl font-black gradient-text text-center mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            🔐 Forgot Password
          </motion.h2>

          <motion.p
            className="text-slate-400 text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Enter your email to receive a password reset link
          </motion.p>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none transition"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-2xl py-3 px-6 font-semibold shadow-lg transition ${
                loading
                  ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-cyan-500/20 hover:opacity-95"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Sending...
                </div>
              ) : (
                "📧 Send Reset Link"
              )}
            </button>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}
