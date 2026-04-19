import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { API_ONE } from "../api/api";

export default function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    fatherName: "",
    enrollmentNumber: "",
    semester: "",
    admissionYear: "",
    course: "",
    phoneNumber: "",
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [existingFaceEncoding, setExistingFaceEncoding] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) loadStudent(id);
  }, [id]);

  const loadStudent = async (studentId) => {
    try {
      const { data } = await API_ONE.get(`/students/${studentId}`);
      setForm({
        name: data.name || "",
        email: data.email || "",
        password: "",
        fatherName: data.fatherName || "",
        enrollmentNumber: data.enrollmentNumber || "",
        semester: data.semester || "",
        admissionYear: data.admissionYear || "",
        course: data.course || "",
        phoneNumber: data.phoneNumber || "",
      });

      if (data.faceEncoding) {
        setExistingFaceEncoding(data.faceEncoding);
        if (typeof data.faceEncoding === "string")
          setPreview(data.faceEncoding);
      }
    } catch (err) {
      console.error("Error loading student:", err);
      setMessage("Failed to load student data");
      setIsError(true);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = { ...form };
      if (photo && preview) payload.faceEncoding = preview;
      else if (existingFaceEncoding)
        payload.faceEncoding = existingFaceEncoding;

      const { data } = await API_ONE.put(`/students/${id}`, payload);

      setMessage(data.message || "Student updated successfully");
      setIsError(false);
      setTimeout(() => navigate("/admin/students"), 2000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.message || "Error updating student";
      setMessage(errorMsg);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="text-5xl font-black gradient-text mb-2">
            ✏️ Edit Student
          </h1>
          <p className="text-slate-400">
            Update student information and profile details.
          </p>
        </motion.header>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-4 mb-8 text-center font-semibold ${
              isError
                ? "bg-red-500/10 text-red-300 border border-red-500/20"
                : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
            }`}
          >
            {message}
          </motion.div>
        )}

        <motion.form
          onSubmit={handleSubmit}
          className="glass border border-cyan-500/20 rounded-3xl p-8 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none transition"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none transition"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Father's Name
              </label>
              <input
                type="text"
                name="fatherName"
                value={form.fatherName}
                onChange={handleChange}
                placeholder="Enter father's name"
                className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none transition"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Enrollment Number
              </label>
              <input
                type="text"
                name="enrollmentNumber"
                value={form.enrollmentNumber}
                onChange={handleChange}
                placeholder="Enter enrollment number"
                className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none transition"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Course
              </label>
              <input
                type="text"
                name="course"
                value={form.course}
                onChange={handleChange}
                placeholder="Enter course name"
                className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none transition"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Semester
              </label>
              <input
                type="number"
                name="semester"
                value={form.semester}
                onChange={handleChange}
                placeholder="Enter semester"
                className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none transition"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Admission Year
              </label>
              <input
                type="number"
                name="admissionYear"
                value={form.admissionYear}
                onChange={handleChange}
                placeholder="Enter admission year"
                className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none transition"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none transition"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Profile Photo
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30 transition"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Upload a new photo to update the student's face recognition
                  data.
                </p>
              </div>
              {preview && (
                <div className="bg-slate-900/70 rounded-2xl border border-slate-700/60 p-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-xl border border-slate-600"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row pt-6 border-t border-slate-700/60">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 rounded-2xl py-3 px-6 font-semibold shadow-lg transition ${
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
                  Updating...
                </div>
              ) : (
                "Update Student"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/students")}
              className="flex-1 rounded-2xl border border-slate-700/80 bg-slate-900/80 py-3 px-6 text-slate-200 font-semibold hover:bg-slate-800 transition"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
