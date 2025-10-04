import { useState, useEffect } from "react";
import { API_ONE } from "../api/api";
import { motion } from "framer-motion";

export default function StudentDashboard() {
  const [profile, setProfile] = useState({});
  const [attendance, setAttendance] = useState([]);
  const [userID, setUserID] = useState("");

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API_ONE.get("/auth/me"); // current logged-in user
        setUserID(data._id);
        setProfile(data);
      } catch (err) {
        //.error("Error fetching profile:", err);
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
        setAttendance(data);
      } catch (err) {
        //.error("Error fetching attendance:", err);
      }
    };
    fetchAttendance();
  }, [userID]);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <motion.h1
        className="text-4xl md:text-5xl font-bold text-indigo-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Student Dashboard
      </motion.h1>

      {/* Profile Section */}
      <motion.div
        className="p-6 bg-white rounded-xl shadow space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold mb-2 text-indigo-600">Profile</h2>
        <p>
          <span className="font-semibold">Name:</span> {profile.name || "-"}
        </p>
        <p>
          <span className="font-semibold">Email:</span> {profile.email || "-"}
        </p>
        <p>
          <span className="font-semibold">Enrollment Number:</span>{" "}
          {profile.enrollmentNumber || "-"}
        </p>
        <p>
          <span className="font-semibold">Course:</span> {profile.course || "-"}
        </p>
        <p>
          <span className="font-semibold">Semester:</span>{" "}
          {profile.semester || "-"}
        </p>
        <p>
          <span className="font-semibold">Admission Year:</span>{" "}
          {profile.admissionYear || "-"}
        </p>
        <p>
          <span className="font-semibold">Phone Number:</span>{" "}
          {profile.phoneNumber || "-"}
        </p>
      </motion.div>

      {/* Attendance Section */}
      <motion.div
        className="p-6 bg-white rounded-xl shadow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600">
          Attendance
        </h2>

        {attendance.length === 0 ? (
          <p className="text-gray-500">No attendance records yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-indigo-100">
                <tr>
                  <th className="border p-3 text-left">Date</th>
                  <th className="border p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((a) => (
                  <tr
                    key={a._id}
                    className="border-b hover:bg-indigo-50 transition-colors"
                  >
                    <td className="border p-3">
                      {new Date(a.date).toLocaleDateString()}
                    </td>
                    <td className="border p-3">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
