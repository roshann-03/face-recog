import { useState, useEffect } from "react";
import { API_ONE } from "../api/api";
import { motion } from "framer-motion";

export default function StudentDashboard() {
  const [profile, setProfile] = useState({});
  const [attendance, setAttendance] = useState([]);
  const [userID, setUserID] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API_ONE.get("/auth/me");
        setUserID(data._id);
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  // Fetch attendance when userID is available
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        if (!userID) return;
        const { data } = await API_ONE.get(`/attendance/student/${userID}`);
        setAttendance(data?.attendance || []);
      } catch (err) {
        console.error("Error fetching attendance:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [userID]);

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
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-5xl font-black gradient-text mb-2">
            👨‍🎓 Student Dashboard
          </h1>
          <p className="text-slate-400">
            Welcome back! Here's your academic profile and attendance overview.
          </p>
        </motion.header>

        {/* Profile Section */}
        <motion.div
          className="glass border border-cyan-500/20 rounded-3xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-100 mb-2">
                📋 Profile Information
              </h2>
              <p className="text-slate-400">
                Your personal and academic details
              </p>
            </div>
            <div className="bg-slate-900/70 rounded-3xl border border-slate-700/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-1">
                Student ID
              </p>
              <p className="text-white font-semibold">
                {profile.enrollmentNumber || "—"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Full Name", value: profile.name, icon: "👤" },
              { title: "Email", value: profile.email, icon: "📧" },
              { title: "Course", value: profile.course, icon: "🏫" },
              { title: "Semester", value: profile.semester, icon: "📚" },
              {
                title: "Admission Year",
                value: profile.admissionYear,
                icon: "📅",
              },
              { title: "Phone", value: profile.phoneNumber, icon: "📞" },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900/70 rounded-3xl border border-slate-700/60 p-5"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">
                  {item.icon} {item.title}
                </p>
                <p className="text-white font-semibold">{item.value || "—"}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Attendance Section */}
        <motion.div
          className="glass border border-blue-500/20 rounded-3xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-blue-300 mb-2">
                📊 Attendance Overview
              </h2>
              <p className="text-slate-400">
                Your attendance record and statistics
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="bg-slate-900/80 rounded-3xl border border-slate-700/70 p-5 text-center">
                <p className="text-4xl font-bold text-green-400">
                  {totalPresent}
                </p>
                <p className="text-sm text-slate-400">Present Days</p>
              </div>
              <div className="bg-slate-900/80 rounded-3xl border border-slate-700/70 p-5 text-center">
                <p className="text-4xl font-bold text-red-400">{totalAbsent}</p>
                <p className="text-sm text-slate-400">Absent Days</p>
              </div>
              <div className="bg-slate-900/80 rounded-3xl border border-slate-700/70 p-5 text-center">
                <p className="text-4xl font-bold text-cyan-300">
                  {attendancePercentage}%
                </p>
                <p className="text-sm text-slate-400">Attendance Rate</p>
              </div>
            </div>
          </div>

          {attendance.length === 0 ? (
            <div className="rounded-3xl border border-slate-700/70 bg-slate-900/70 py-16 text-center text-slate-400">
              <p className="text-2xl mb-2">No attendance records available</p>
              <p>
                Attendance data will appear here once you've attended sessions.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-slate-700/70 bg-slate-950/90">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-900/90 text-slate-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950">
                  {attendance.map((record, index) => (
                    <motion.tr
                      key={record._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-slate-900/80 transition-colors"
                    >
                      <td className="px-6 py-4 text-slate-200 font-medium">
                        {record.date
                          ? new Date(record.date).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                            record.status === "present"
                              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                          }`}
                        >
                          {record.status === "present" ? "Present" : "Absent"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {record.timestamp
                          ? new Date(record.timestamp).toLocaleTimeString()
                          : "—"}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
