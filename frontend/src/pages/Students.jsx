import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_TWO;

// Helper function for authenticated requests
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
};

export default function StudentForm() {
  const [students, setStudents] = useState([]);
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
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchStudents();
    if (id) loadStudent(id);
  }, [id]);

  const fetchStudents = async () => {
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_BASE_URL_ONE}/students`,
      );
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      toast.error("Failed to fetch students");
    }
  };

  const loadStudent = async (studentId) => {
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_BASE_URL_ONE}/students/${studentId}`,
      );
      const data = await res.json();
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
      setEditingId(studentId);

      if (data.faceEncoding) {
        setExistingFaceEncoding(data.faceEncoding);
        if (typeof data.faceEncoding === "string")
          setPreview(data.faceEncoding);
        else setPreview(null);
      } else setPreview(null);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error("Failed to load student");
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
    if (!photo && !editingId) {
      toast.error("Please select a photo");
      return;
    }

    setLoading(true);

    try {
      const payload = { ...form };

      if (photo && preview) payload.faceEncoding = preview;
      else if (editingId && existingFaceEncoding)
        payload.faceEncoding = existingFaceEncoding;

      const res = await fetchWithAuth(
        `${API_BASE_URL}/students${editingId ? `/${editingId}` : ""}`,
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error saving student");

      toast.success(data.message || "Student saved successfully");
      setForm({
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
      setPhoto(null);
      setPreview(null);
      setExistingFaceEncoding(null);
      setEditingId(null);
      fetchStudents();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this student?")) return;
    try {
      await fetchWithAuth(
        `${import.meta.env.VITE_API_BASE_URL_ONE}/students/${id}`,
        {
          method: "DELETE",
        },
      );
      toast.success("Student deleted successfully");
      fetchStudents();
    } catch {
      toast.error("Error deleting student");
    }
  };

  const handleCancel = () => {
    setForm({
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
    setPhoto(null);
    setPreview(null);
    setExistingFaceEncoding(null);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="text-5xl font-black gradient-text mb-2">
            👨‍🎓 {editingId ? "Edit Student" : "Register Student"}
          </h1>
          <p className="text-slate-400">
            Manage student information and face recognition data
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="glass border border-cyan-500/20 rounded-2xl p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-cyan-400 mb-6">
            📝 Student Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Form Fields */}
            {[
              { name: "name", placeholder: "Full Name", type: "text", span: 6 },
              {
                name: "email",
                placeholder: "Email Address",
                type: "email",
                span: 6,
              },
              !editingId && {
                name: "password",
                placeholder: "Password",
                type: "password",
                span: 6,
              },
              {
                name: "fatherName",
                placeholder: "Father's Name",
                type: "text",
                span: 6,
              },
              {
                name: "enrollmentNumber",
                placeholder: "Enrollment Number",
                type: "text",
                span: 4,
              },
              {
                name: "semester",
                placeholder: "Semester",
                type: "number",
                span: 2,
              },
              {
                name: "admissionYear",
                placeholder: "Admission Year",
                type: "number",
                span: 2,
              },
              { name: "course", placeholder: "Course", type: "text", span: 4 },
              {
                name: "phoneNumber",
                placeholder: "Phone Number",
                type: "text",
                span: 4,
              },
            ]
              .filter(Boolean)
              .map((field, index) => (
                <motion.div
                  key={field.name}
                  className={`md:col-span-${field.span}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    {field.placeholder}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-lg focus:outline-none focus:border-cyan-400 transition-colors"
                    required
                  />
                </motion.div>
              ))}

            {/* Photo Upload */}
            <motion.div
              className="md:col-span-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-slate-300 text-sm font-medium mb-2">
                📸 Student Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-cyan-400 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-slate-950 hover:file:bg-cyan-400"
              />
              {preview && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4"
                >
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-32 h-32 object-cover border-2 border-cyan-500/30 rounded-xl"
                  />
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div
            className="flex gap-4 mt-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 btn-glow py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold shadow-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all"
            >
              {loading
                ? editingId
                  ? "🔄 Updating..."
                  : "📝 Registering..."
                : editingId
                  ? "💾 Update Student"
                  : "➕ Register Student"}
            </motion.button>
            {editingId && (
              <motion.button
                type="button"
                onClick={handleCancel}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-slate-700 text-slate-300 rounded-lg font-bold hover:bg-slate-600 transition-all"
              >
                ❌ Cancel
              </motion.button>
            )}
          </motion.div>
        </motion.form>

        {/* Student Table */}
        <motion.div
          className="glass border border-blue-500/20 rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-blue-400 mb-6">
            📊 Recently Added Students
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  {[
                    "👤 Name",
                    "📧 Email",
                    "👨‍👩‍👧 Father's Name",
                    "🎓 Enrollment",
                    "📚 Semester",
                    "📅 Admission Year",
                    "🏫 Course",
                    "📞 Phone",
                    "⚙️ Actions",
                  ].map((th) => (
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
                  {students
                    .slice(-5)
                    .reverse()
                    .map((s, index) => (
                      <motion.tr
                        key={s._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3 px-4 text-slate-200 font-medium">
                          {s.name}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{s.email}</td>
                        <td className="py-3 px-4 text-slate-400">
                          {s.fatherName}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {s.enrollmentNumber}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {s.semester}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {s.admissionYear}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{s.course}</td>
                        <td className="py-3 px-4 text-slate-400">
                          {s.phoneNumber}
                        </td>
                        <td className="py-3 px-4 space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => loadStudent(s._id)}
                            className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 font-medium transition-colors"
                          >
                            ✏️ Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(s._id)}
                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 font-medium transition-colors"
                          >
                            🗑️ Delete
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
