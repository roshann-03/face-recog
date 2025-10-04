import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { API_ONE, API_TWO } from "../api/api.js";

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [tab, setTab] = useState("students"); // "students" or "admins"
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [scannedStudents, setScannedStudents] = useState([]);
  const [scannedImage, setScannedImage] = useState(null);

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
      showMessage("Failed to fetch students", true);
      //.error(err);
    }
  };

  const fetchAdmins = async () => {
    try {
      const { data } = await API_ONE.get("/admins");
      setAdmins(data);
    } catch (err) {
      showMessage("Failed to fetch admins", true);
      //.error(err);
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
        showMessage(
          `✅ Attendance registered for ${data.students.length} student(s)`,
          false
        );

        // Match scanned names with full student details
        const recognizedDetails = students
          .filter((s) => data.students.some((n) => n.name === s.name))
          .map((s) => ({
            name: s.name,
            enrollmentNumber: s.enrollmentNumber,
            course: s.course,
            semester: s.semester,
          }));

        setScannedStudents(recognizedDetails);
      } else {
        showMessage("⚠️ No recognized faces detected", true);
        setScannedStudents([]);
      }
    } catch (err) {
      showMessage("❌ Error scanning faces", true);
      //.error(err);
    }
  };

  const handleStartScanning = () => {
    setShowWebcam(true);
    setScanning(true);
    showMessage("Scanning...", false);
    const id = setInterval(scanOnce, 2000);
    setIntervalId(id);
  };

  const handleStopScanning = () => {
    clearInterval(intervalId);
    setIntervalId(null);
    setScanning(false);
    showMessage("Scanning stopped", false);
    setShowWebcam(false);
    setScannedImage(null);
    if (webcamRef.current?.video?.srcObject) {
      webcamRef.current.video.srcObject
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;

    try {
      const { data } = await API_ONE.delete(`/admins/${id}`);
      showMessage(data.message || "Admin deleted successfully", false);
      fetchAdmins();
    } catch (err) {
      showMessage(err?.response?.data?.message || "Error deleting admin", true);
      //.error(err);
    }
  };

  const handleAdminChange = (e) => {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API_ONE.post("/admins", adminForm);
      showMessage(data.message || "Admin created successfully", false);
      setAdminForm({ name: "", email: "", password: "" });
      fetchAdmins();
    } catch (err) {
      showMessage(
        err?.response?.data?.error?.message || "Error creating admin",
        true
      );
    }
  };

  const showMessage = (msg, error = false) => {
    setMessage(msg);
    setIsError(error);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-4xl font-bold text-indigo-700">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-4">
        <button
          onClick={() => setTab("students")}
          className={`px-4 py-2 font-semibold ${
            tab === "students"
              ? "border-b-2 border-indigo-600"
              : "text-gray-500"
          }`}
        >
          Students
        </button>
        <button
          onClick={() => setTab("admins")}
          className={`px-4 py-2 font-semibold ${
            tab === "admins" ? "border-b-2 border-indigo-600" : "text-gray-500"
          }`}
        >
          Admins
        </button>
      </div>

      {message && (
        <p
          className={`text-center font-bold mt-4 ${
            isError ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}

      {/* Students Tab */}
      {tab === "students" && (
        <>
          <button
            onClick={() => navigate("/students/new")}
            className="bg-indigo-600 text-white px-5 py-3 rounded-lg font-semibold shadow hover:shadow-lg hover:bg-indigo-700 transition mb-4"
          >
            Add New Student
          </button>

          {showWebcam && (
            <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
              {scannedImage ? (
                <img
                  src={scannedImage}
                  alt="Scanned"
                  className="rounded-xl w-full h-auto border border-gray-200"
                />
              ) : (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "user" }}
                  className="rounded-xl w-full h-auto border border-gray-200"
                />
              )}
            </div>
          )}

          <div className="flex gap-3 mb-4">
            {!scanning ? (
              <button
                onClick={handleStartScanning}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold shadow hover:bg-green-700 transition"
              >
                Start Scanning
              </button>
            ) : (
              <button
                onClick={handleStopScanning}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold shadow hover:bg-red-700 transition"
              >
                Stop Scanning
              </button>
            )}
          </div>

          {scannedStudents.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Students who attended
              </h2>
              <table className="w-full text-left border-collapse shadow rounded-md overflow-hidden">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Enrollment Number</th>
                    <th className="p-3">Course</th>
                    <th className="p-3">Semester</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {scannedStudents.map((s, idx) => (
                    <tr
                      key={idx}
                      className="border-b hover:bg-indigo-50 transition-colors"
                    >
                      <td className="p-3">{s.name}</td>
                      <td className="p-3">{s.enrollmentNumber}</td>
                      <td className="p-3">{s.course}</td>
                      <td className="p-3">{s.semester}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Admins Tab */}
      {tab === "admins" && (
        <div className="space-y-6">
          <form
            onSubmit={handleAdminSubmit}
            className="bg-white p-6 rounded-xl shadow space-y-4"
          >
            <h2 className="text-xl font-semibold text-gray-700">
              Add New Admin
            </h2>
            <input
              type="text"
              name="name"
              value={adminForm.name}
              onChange={handleAdminChange}
              placeholder="Name"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
              required
            />
            <input
              type="email"
              name="email"
              value={adminForm.email}
              onChange={handleAdminChange}
              placeholder="Email"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
              required
            />
            <input
              type="password"
              name="password"
              value={adminForm.password}
              onChange={handleAdminChange}
              placeholder="Password"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
              required
            />
            <button className="bg-indigo-600 text-white px-5 py-3 rounded-lg font-semibold shadow hover:bg-indigo-700 transition">
              Add Admin
            </button>
          </form>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Existing Admins
            </h2>
            <ul className="divide-y divide-gray-200">
              {admins.map((a) => (
                <li
                  key={a._id}
                  className="py-2 flex justify-between items-center"
                >
                  <div>
                    <span className="font-medium">{a.name}</span>{" "}
                    <span className="text-gray-500">({a.email})</span>
                  </div>
                  <button
                    onClick={() => handleDeleteAdmin(a._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
