import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { API_ONE } from "../api/api.js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState({});
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudent();
    fetchAttendance();
  }, [id]);

  const fetchStudent = async () => {
    try {
      const { data } = await API_ONE.get(`/students/${id}`);
      setStudent(data);
    } catch (error) {
      console.error("Error fetching student:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const { data } = await API_ONE.get(`/attendance/student/${id}`);
      setAttendance(data?.attendance || []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  const chartData = [...attendance]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((a) => ({
      date: new Date(a.date).toLocaleDateString(),
      present: a.status === "present" ? 1 : 0,
    }));

  const totalPresent = attendance.filter((a) => a.status === "present").length;
  const totalAbsent = attendance.filter((a) => a.status === "absent").length;
  const attendancePercentage =
    attendance.length > 0
      ? ((totalPresent / attendance.length) * 100).toFixed(1)
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="text-5xl font-black gradient-text mb-2">
            👨‍🎓 {student.name || "Student Details"}
          </h1>
          <p className="text-slate-400">
            View student information and attendance records
          </p>
        </motion.div>

        {/* Student Information Card */}
        <motion.div
          className="glass border border-cyan-500/20 rounded-2xl p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-cyan-400 mb-6">
            📋 Student Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "📧 Email", value: student.email },
              { label: "🎓 Enrollment No", value: student.enrollmentNumber },
              { label: "🏫 Course", value: student.course },
              { label: "📚 Semester", value: student.semester },
              { label: "👨‍👩‍👧 Father's Name", value: student.fatherName },
              { label: "📅 Admission Year", value: student.admissionYear },
              { label: "📞 Phone Number", value: student.phoneNumber },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50"
              >
                <div className="text-slate-400 text-sm font-medium mb-1">
                  {item.label}
                </div>
                <div className="text-white font-semibold">
                  {item.value || "N/A"}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Attendance Section */}
        <motion.div
          className="glass border border-blue-500/20 rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-blue-400 mb-6">
            📊 Attendance Records
          </h2>

          {/* Attendance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center"
            >
              <div className="text-3xl font-bold text-green-400 mb-2">
                {totalPresent}
              </div>
              <div className="text-slate-300">Present Days</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center"
            >
              <div className="text-3xl font-bold text-red-400 mb-2">
                {totalAbsent}
              </div>
              <div className="text-slate-300">Absent Days</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-6 text-center"
            >
              <div className="text-3xl font-bold text-cyan-400 mb-2">
                {attendancePercentage}%
              </div>
              <div className="text-slate-300">Attendance Rate</div>
            </motion.div>
          </div>

          {attendance.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">📭</div>
              <p className="text-slate-400 text-lg">
                No attendance records yet.
              </p>
            </motion.div>
          ) : (
            <>
              {/* Attendance Table */}
              <div className="overflow-x-auto mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      {["📅 Date", "📊 Status", "⏰ Time"].map((th) => (
                        <th
                          key={th}
                          className="text-left py-3 px-4 text-cyan-400 font-bold"
                        >
                          {th}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {attendance.map((a, index) => (
                        <motion.tr
                          key={a._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-3 px-4 text-slate-200 font-medium">
                            {new Date(a.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                a.status === "present"
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : "bg-red-500/20 text-red-400 border border-red-500/30"
                              }`}
                            >
                              {a.status === "present"
                                ? "✅ Present"
                                : "❌ Absent"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {a.timestamp
                              ? new Date(a.timestamp).toLocaleTimeString()
                              : "N/A"}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Attendance Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-xl font-bold text-blue-400 mb-4">
                  📈 Attendance Trend
                </h3>
                <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700/50">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #475569",
                          borderRadius: "8px",
                          color: "#f1f5f9",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="present"
                        stroke="#06b6d4"
                        strokeWidth={3}
                        dot={{ fill: "#06b6d4", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#06b6d4", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
