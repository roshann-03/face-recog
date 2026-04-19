import { useState } from "react";
import { motion } from "framer-motion";
import { API_ONE } from "../api/api";
import toast from "react-hot-toast";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    enrollmentNumber: "",
    course: "",
    semester: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await API_ONE.post("/contact", form);
      setForm({
        name: "",
        enrollmentNumber: "",
        course: "",
        semester: "",
        message: "",
      });
      toast.success(data.message || "Query submitted successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error submitting query");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass border border-cyan-500/20 max-w-3xl w-full p-8 rounded-3xl shadow-2xl"
      >
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300 mb-2">
            Contact Support
          </p>
          <h2 className="text-3xl font-bold text-white">Student Query Form</h2>
          <p className="text-slate-400 mt-2">
            Send a message to support and we’ll get back to you shortly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
            required
          />
          <input
            name="enrollmentNumber"
            value={form.enrollmentNumber}
            onChange={handleChange}
            placeholder="Enrollment Number"
            className="rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
            required
          />
          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="course"
              value={form.course}
              onChange={handleChange}
              placeholder="Course"
              className="rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              required
            />
            <input
              type="number"
              name="semester"
              value={form.semester}
              onChange={handleChange}
              placeholder="Semester"
              className="rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              required
            />
          </div>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Write your query..."
            className="rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none resize-none min-h-[140px]"
            rows="5"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-2xl px-6 py-4 text-sm font-semibold text-slate-950 transition ${
              loading
                ? "bg-slate-700 cursor-not-allowed"
                : "bg-cyan-500 hover:bg-cyan-400"
            }`}
          >
            {loading ? "Submitting..." : "Send Query"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
