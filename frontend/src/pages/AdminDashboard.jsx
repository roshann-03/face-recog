import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { API_ONE, API_TWO } from "../api/api.js";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [tab, setTab] = useState("students");
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [scannedStudents, setScannedStudents] = useState([]);
  const [scannedImage, setScannedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const webcamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
    fetchAdmins();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data } = await API_ONE.get("/students");
      setStudents(data);
    } catch (err) {
      toast.error("Failed to fetch students");
    }
  };

  const fetchAdmins = async () => {
    try {
      const { data } = await API_ONE.get("/admins");
      setAdmins(data);
    } catch (err) {
      toast.error("Failed to fetch admins");
    }
  };

  const scanOnce = async () => {
    if (!webcamRef.current) return;
    const image = webcamRef.current.getScreenshot();
    if (!image) return;

    try {
      const { data } = await API_TWO.post("/attendance/scan", { image });
      setScannedImage(data.image || null);

      if (data.students && data.students.length > 0) {
        const recognizedDetails = students
          .filter((s) => data.students.some((n) => n.name === s.name))
          .map((s) => ({
            name: s.name,
            enrollmentNumber: s.enrollmentNumber,
            course: s.course,
            semester: s.semester,
          }));
        setScannedStudents(recognizedDetails);
        toast.success(`✅ ${data.students.length} student(s) recognized`);
      } else {
        toast("⚠️ No faces detected", { icon: "👀" });
      }
    } catch (err) {
      toast.error("❌ Error scanning faces");
    }
  };

  const handleStartScanning = () => {
    setShowWebcam(true);
    setScanning(true);
    toast.loading("Starting face scan...");
    const id = setInterval(scanOnce, 2000);
    setIntervalId(id);
  };

  const handleStopScanning = () => {
    clearInterval(intervalId);
    setIntervalId(null);
    setScanning(false);
    setShowWebcam(false);
    setScannedImage(null);
    if (webcamRef.current?.video?.srcObject) {
      webcamRef.current.video.srcObject
        .getTracks()
        .forEach((track) => track.stop());
    }
    toast.success("Scanning stopped");
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Delete this admin?")) return;
    try {
      await API_ONE.delete(`/admins/${id}`);
      toast.success("Admin deleted");
      fetchAdmins();
    } catch (err) {
      toast.error("Error deleting admin");
    }
  };

  const handleAdminChange = (e) => {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API_ONE.post("/admins", adminForm);
      toast.success("Admin created successfully");
      setAdminForm({ name: "", email: "", password: "" });
      fetchAdmins();
    } catch (err) {
      toast.error(
        err?.response?.data?.error?.message || "Error creating admin",
      );
    } finally {
      setLoading(false);
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-5xl font-black gradient-text mb-2">
            👨‍💼 Admin Dashboard
          </h1>
          <p className="text-slate-400">
            Manage students, attendance, and admin accounts
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass border border-cyan-500/20 rounded-2xl p-2 mb-8 flex gap-2 w-fit"
        >
          {["students", "admins"].map((tabName) => (
            <button
              key={tabName}
              onClick={() => setTab(tabName)}
              className={`px-6 py-3 rounded-lg font-bold transition-all capitalize ${
                tab === tabName
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-lg"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              {tabName === "students" ? "👥 Students" : "👨‍💼 Admins"}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {tab === "students" ? (
            <motion.div
              key="students"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              {/* Add Student Button */}
              <motion.button
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/students/new")}
                className="btn-glow w-full md:w-auto px-8 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-slate-950 rounded-lg font-bold shadow-lg hover:from-green-300 hover:to-emerald-400"
              >
                ➕ Add New Student
              </motion.button>

              {/* Webcam Section */}
              {showWebcam && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass border border-cyan-500/20 rounded-2xl p-6"
                >
                  <h2 className="text-2xl font-bold text-cyan-400 mb-4">
                    📸 Face Recognition
                  </h2>
                  {scannedImage ? (
                    <img
                      src={scannedImage}
                      alt="Scanned"
                      className="rounded-xl w-full h-auto border-2 border-cyan-500/30"
                    />
                  ) : (
                    <div className="rounded-xl overflow-hidden border-2 border-cyan-500/30">
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: "user" }}
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                </motion.div>
              )}

              {/* Scan Controls */}
              <div className="flex gap-3">
                {!scanning ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartScanning}
                    className="flex-1 btn-glow py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold shadow-lg hover:from-green-600 hover:to-emerald-700"
                  >
                    ▶️ Start Scanning
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStopScanning}
                    className="flex-1 btn-glow py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-bold shadow-lg hover:from-red-600 hover:to-red-700"
                  >
                    ⏹️ Stop Scanning
                  </motion.button>
                )}
              </div>

              {/* Scanned Results */}
              <AnimatePresence>
                {scannedStudents.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="glass border border-green-500/20 rounded-2xl p-6"
                  >
                    <h2 className="text-2xl font-bold text-green-400 mb-6">
                      ✅ Attendance Marked ({scannedStudents.length})
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-3 px-4 text-cyan-400 font-bold">
                              #
                            </th>
                            <th className="text-left py-3 px-4 text-cyan-400 font-bold">
                              Name
                            </th>
                            <th className="text-left py-3 px-4 text-cyan-400 font-bold">
                              Enrollment
                            </th>
                            <th className="text-left py-3 px-4 text-cyan-400 font-bold">
                              Course
                            </th>
                            <th className="text-left py-3 px-4 text-cyan-400 font-bold">
                              Sem
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {scannedStudents.map((s, idx) => (
                            <motion.tr
                              key={idx}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: idx * 0.05 }}
                              className="border-b border-slate-800 hover:bg-green-500/5 transition-colors"
                            >
                              <td className="py-3 px-4 text-slate-400">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-4 text-slate-200 font-medium">
                                {s.name}
                              </td>
                              <td className="py-3 px-4 text-slate-400">
                                {s.enrollmentNumber}
                              </td>
                              <td className="py-3 px-4 text-slate-400">
                                {s.course}
                              </td>
                              <td className="py-3 px-4 text-slate-400">
                                {s.semester}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="admins"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Add Admin Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-1 glass border border-blue-500/20 rounded-2xl p-6"
              >
                <h2 className="text-2xl font-bold text-blue-400 mb-6">
                  ➕ Add Admin
                </h2>
                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={adminForm.name}
                      onChange={handleAdminChange}
                      placeholder="Full name"
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={adminForm.email}
                      onChange={handleAdminChange}
                      placeholder="admin@email.com"
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={adminForm.password}
                      onChange={handleAdminChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
                      required
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-bold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all"
                  >
                    {loading ? "Adding..." : "Add Admin"}
                  </motion.button>
                </form>
              </motion.div>

              {/* Admins List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 glass border border-purple-500/20 rounded-2xl p-6"
              >
                <h2 className="text-2xl font-bold text-purple-400 mb-6">
                  👥 Existing Admins ({admins.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {admins.map((admin, idx) => (
                    <motion.div
                      key={admin._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ y: -5 }}
                      className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4 flex justify-between items-center hover:border-purple-400/50 transition-all"
                    >
                      <div>
                        <p className="font-bold text-slate-200">{admin.name}</p>
                        <p className="text-sm text-slate-400">{admin.email}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteAdmin(admin._id)}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 font-medium transition-colors"
                      >
                        🗑️
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
