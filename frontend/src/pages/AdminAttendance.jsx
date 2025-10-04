import { useEffect, useState } from "react";
import { API_ONE } from "../api/api.js";
import { Link } from "react-router-dom";

const courseSemesters = {
  BCA: 6,
  MCA: 4,
  IMCA: 8,
  BTECH: 8,
};

export default function AdminAttendance() {
  const [allAttendance, setAllAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState({
    course: "",
    semester: "",
    name: "",
  });

  const fetchAllAttendance = async () => {
    try {
      const { data } = await API_ONE.get("/attendance/all");
      setAllAttendance(data);
      setFilteredAttendance(data);
    } catch (err) {
      //.error(err);
      setMessage("Failed to fetch attendance");
    }
  };

  useEffect(() => {
    fetchAllAttendance();
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = allAttendance;

    if (filters.course) {
      filtered = filtered.filter(
        ({ student }) => student.course.toUpperCase() === filters.course
      );
    }

    if (filters.semester) {
      filtered = filtered.filter(
        ({ student }) => student.semester === Number(filters.semester)
      );
    }

    if (filters.name) {
      filtered = filtered.filter(({ student }) =>
        student.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    setFilteredAttendance(filtered);
  }, [filters, allAttendance]);

  // Update filters
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));

    // Reset semester if course changes
    if (name === "course") {
      setFilters((prev) => ({ ...prev, semester: "" }));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-4xl font-bold text-indigo-700">
        All Students Attendance
      </h1>
      {message && <p className="text-red-600">{message}</p>}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name..."
          name="name"
          value={filters.name}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        />

        <select
          name="course"
          value={filters.course}
          onChange={(e) =>
            setFilters({
              course: e.target.value,
              semester: "", // reset semester when course changes
              name: filters.name,
            })
          }
          className="border p-2 rounded"
        >
          <option value="">All Courses</option>
          {Object.keys(courseSemesters).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          name="semester"
          value={filters.semester}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, semester: e.target.value }))
          }
          className="border p-2 rounded"
          disabled={!filters.course}
        >
          <option value="">All Semesters</option>
          {filters.course &&
            Array.from(
              { length: courseSemesters[filters.course] },
              (_, i) => i + 1
            ).map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
        </select>
      </div>

      {/* Attendance List */}
      {filteredAttendance?.length === 0 ? (
        <p className="text-gray-500">No attendance records found.</p>
      ) : (
        filteredAttendance.map(({ student, attendance }) => (
          <div
            key={student._id}
            className="bg-white rounded-xl shadow p-6 mb-6"
          >
            <h2 className="font-semibold text-lg">
              <Link
                to={`/admin/students/${student._id}`}
                className="text-indigo-600 hover:underline"
              >
                {student.name} ({student.enrollmentNumber})
              </Link>
            </h2>
            <p>
              Course: {student.course}, Semester: {student.semester}
            </p>

            <table className="w-full border-collapse mt-2">
              <thead className="bg-indigo-100">
                <tr>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance?.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center text-gray-500 p-2">
                      No records
                    </td>
                  </tr>
                ) : (
                  attendance.map((a) => (
                    <tr
                      key={a._id}
                      className="border-b hover:bg-indigo-50 transition-colors"
                    >
                      <td className="border p-2">
                        {new Date(a.date).toLocaleDateString()}
                      </td>
                      <td className="border p-2">{a.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
