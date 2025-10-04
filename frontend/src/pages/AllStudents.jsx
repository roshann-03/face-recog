import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ONE } from "../api/api";

export default function AllStudents() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [semesterFilter, setSemesterFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await API_ONE.get("/students");
      const studentArray = response.data || [];
      setStudents(studentArray);
      setFilteredStudents(studentArray);
    } catch (err) {
      //.error(err);
      const errorMsg =
        err.response?.data?.error || err.message || "Failed to fetch students";
      setMessage(errorMsg);
      setIsError(true);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const handleFilter = () => {
    let result = [...students];
    if (semesterFilter) {
      result = result.filter(
        (s) => String(s.semester) === String(semesterFilter)
      );
    }
    if (courseFilter) {
      result = result.filter(
        (s) => s.course.toLowerCase() === courseFilter.toLowerCase()
      );
    }
    setFilteredStudents(result);
  };

  const handleClear = () => {
    setSemesterFilter("");
    setCourseFilter("");
    setFilteredStudents(students);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">All Students</h1>

      {message && (
        <p
          className={`text-center font-bold ${
            isError ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="number"
          placeholder="Filter by Semester"
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />
        <input
          type="text"
          placeholder="Filter by Course"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />
        <button
          onClick={handleFilter}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Apply
        </button>
        <button
          onClick={handleClear}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
        >
          Clear
        </button>
      </div>

      {/* Students */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((s) => (
            <div
              key={s._id}
              className="bg-white p-4 rounded-xl shadow hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 relative"
              onClick={() => navigate(`/admin/students/${s._id}`)}
            >
              <p className="text-lg font-semibold text-gray-800">{s.name}</p>
              <p className="text-gray-500 text-sm mb-1">
                Enrollment: {s.enrollmentNumber} | Semester: {s.semester}
              </p>
              <p className="text-gray-700 mb-1">Course: {s.course}</p>
              <p className="text-gray-700 mb-1">Email: {s.email}</p>
              <p className="text-gray-700 mb-2">Phone: {s.phoneNumber}</p>

              {/* Edit Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering parent onClick
                  navigate(`/admin/students/edit/${s._id}`);
                }}
                className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 col-span-full">
          No students found
        </p>
      )}
    </div>
  );
}
