import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

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
  const [message, setMessage] = useState("");
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
        `${import.meta.env.VITE_API_BASE_URL_ONE}/students`
      );
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      //.error(err);
    }
  };

  const loadStudent = async (studentId) => {
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_BASE_URL_ONE}/students/${studentId}`
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
      //.error(err);
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
    if (!photo && !editingId) return setMessage("Please select a photo");

    setLoading(true);
    setMessage("");

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
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error saving student");

      setMessage(data.message || "Student saved successfully");
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
      setMessage(err.message);
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
        }
      );
      setMessage("Student deleted successfully");
      fetchStudents();
    } catch {
      setMessage("Error deleting student");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      <motion.h1
        className="text-4xl font-bold text-indigo-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {editingId ? "Edit Student" : "Register Student"}
      </motion.h1>

      <motion.form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-6 grid grid-cols-1 md:grid-cols-12 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Form Fields */}
        {[
          { name: "name", placeholder: "Name", type: "text", span: 6 },
          { name: "email", placeholder: "Email", type: "email", span: 6 },
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
          .map((field) => (
            <div key={field.name} className={`md:col-span-${field.span}`}>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          ))}

        {/* Photo Upload */}
        <div className="md:col-span-4 flex flex-col gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="p-2 border rounded-md"
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 object-cover border rounded-md mt-1"
            />
          )}
        </div>

        {/* Submit / Cancel Buttons */}
        <div className="md:col-span-12 mt-2 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 py-3 px-6 rounded-md font-semibold transition-colors ${
              loading
                ? "bg-gray-400 text-gray-100 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {loading
              ? editingId
                ? "Updating..."
                : "Registering..."
              : editingId
              ? "Update Student"
              : "Register Student"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
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
                setMessage("");
              }}
              className="flex-1 py-3 px-6 rounded-md font-semibold bg-gray-500 text-white hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </motion.form>

      {message && (
        <motion.p
          className="mt-4 text-center font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ color: message.includes("error") ? "#dc2626" : "#16a34a" }}
        >
          {message}
        </motion.p>
      )}

      {/* Student Table */}
      <motion.div
        className="mt-10 overflow-x-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
          Recently Added Students
        </h2>
        <table className="w-full text-left border-collapse shadow-lg rounded-md overflow-hidden">
          <thead className="bg-indigo-600 text-white">
            <tr>
              {[
                "Name",
                "Email",
                "Father's Name",
                "Enrollment Number",
                "Semester",
                "Admission Year",
                "Course",
                "Phone Number",
                "Actions",
              ].map((th) => (
                <th key={th} className="p-3">
                  {th}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {students
              .slice(-5)
              .reverse()
              .map((s) => (
                <tr
                  key={s._id}
                  className="border-b hover:bg-indigo-50 transition-colors"
                >
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">{s.email}</td>
                  <td className="p-3">{s.fatherName}</td>
                  <td className="p-3">{s.enrollmentNumber}</td>
                  <td className="p-3">{s.semester}</td>
                  <td className="p-3">{s.admissionYear}</td>
                  <td className="p-3">{s.course}</td>
                  <td className="p-3">{s.phoneNumber}</td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => loadStudent(s._id)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
