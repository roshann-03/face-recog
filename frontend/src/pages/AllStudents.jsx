import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { API_ONE } from "../api/api";

export default function AllStudents() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [semesterFilter, setSemesterFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const parseStudentDate = (student) => {
    if (student.createdAt) return new Date(student.createdAt);
    if (student.admissionYear)
      return new Date(`${student.admissionYear}-01-01`);
    return null;
  };

  const fetchStudents = async () => {
    try {
      const response = await API_ONE.get("/students");
      const studentArray = response.data || [];
      setStudents(studentArray);
      setFilteredStudents(studentArray);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.message || "Failed to fetch students";
      setMessage(errorMsg);
      setIsError(true);
      setTimeout(() => setMessage(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = (items) => {
    const headers = [
      "Name",
      "Email",
      "Enrollment Number",
      "Semester",
      "Course",
      "Phone Number",
      "Admission Year",
      "Created At",
    ];

    const rows = items.map((student) => {
      const createdAt = student.createdAt
        ? new Date(student.createdAt).toLocaleDateString()
        : student.admissionYear || "";
      return [
        student.name,
        student.email,
        student.enrollmentNumber,
        student.semester,
        student.course,
        student.phoneNumber,
        student.admissionYear,
        createdAt,
      ]
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `students-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFilter = () => {
    let result = [...students];

    if (semesterFilter) {
      result = result.filter(
        (s) => String(s.semester) === String(semesterFilter),
      );
    }

    if (courseFilter) {
      result = result.filter(
        (s) => s.course?.toLowerCase() === courseFilter.toLowerCase(),
      );
    }

    if (startDate) {
      result = result.filter((s) => {
        const date = parseStudentDate(s);
        return date ? date >= new Date(startDate) : false;
      });
    }

    if (endDate) {
      result = result.filter((s) => {
        const date = parseStudentDate(s);
        return date ? date <= new Date(endDate) : false;
      });
    }

    setFilteredStudents(result);
  };

  const handleClear = () => {
    setSemesterFilter("");
    setCourseFilter("");
    setStartDate("");
    setEndDate("");
    setFilteredStudents(students);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="text-5xl font-black gradient-text mb-2">
            👩‍🎓 All Students
          </h1>
          <p className="text-slate-400">
            Browse registered learners, filter by course, semester, and
            admission range, then export the current list.
          </p>
        </motion.header>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-4 mb-6 text-center font-semibold ${
              isError
                ? "bg-red-500/10 text-red-300 border border-red-500/20"
                : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
            }`}
          >
            {message}
          </motion.div>
        )}

        <motion.div
          className="glass border border-cyan-500/20 rounded-3xl p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="grid gap-4 xl:grid-cols-[1fr_auto] items-end">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="bg-slate-900/70 border border-slate-700/60 rounded-2xl p-4">
                <p className="text-sm text-slate-400">Total Students</p>
                <p className="text-3xl font-bold text-cyan-300">
                  {students.length}
                </p>
              </div>
              <div className="bg-slate-900/70 border border-slate-700/60 rounded-2xl p-4">
                <p className="text-sm text-slate-400">Filtered</p>
                <p className="text-3xl font-bold text-blue-300">
                  {filteredStudents.length}
                </p>
              </div>
              <div className="bg-slate-900/70 border border-slate-700/60 rounded-2xl p-4">
                <p className="text-sm text-slate-400">Semester</p>
                <p className="text-3xl font-bold text-slate-100">
                  {semesterFilter || "All"}
                </p>
              </div>
              <div className="bg-slate-900/70 border border-slate-700/60 rounded-2xl p-4">
                <p className="text-sm text-slate-400">Course</p>
                <p className="text-3xl font-bold text-slate-100">
                  {courseFilter || "All"}
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                exportCsv(filteredStudents.length ? filteredStudents : students)
              }
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-white font-semibold shadow-lg shadow-cyan-500/20 hover:opacity-95 transition"
            >
              Export CSV
            </button>
          </div>

          <div className="grid gap-4 mt-6 xl:grid-cols-[repeat(3,minmax(0,1fr))]">
            <input
              type="number"
              placeholder="Semester"
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Course"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-200 focus:border-cyan-400 focus:outline-none"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-200 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-6">
            <button
              onClick={handleFilter}
              className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-3 text-white font-semibold shadow-lg shadow-cyan-500/20 hover:opacity-95 transition"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClear}
              className="w-full sm:w-auto rounded-2xl border border-slate-700/80 bg-slate-900/80 px-6 py-3 text-slate-200 font-semibold hover:bg-slate-800 transition"
            >
              Reset Filters
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[320px]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full"
            />
          </div>
        ) : (
          <div className="glass border border-slate-700/80 rounded-3xl overflow-hidden">
            <div className="bg-slate-950/90 px-6 py-4 border-b border-slate-700/80">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase text-slate-400 tracking-[0.2em]">
                    Student List
                  </p>
                  <h2 className="text-2xl font-bold text-slate-100">
                    Registered Students
                  </h2>
                </div>
                <p className="text-sm text-slate-400">
                  Showing {filteredStudents.length} of {students.length}
                </p>
              </div>
            </div>

            {filteredStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-slate-900 text-slate-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                        Enrollment
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                        Semester
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                        Admission Year
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950">
                    {filteredStudents.map((s) => (
                      <tr
                        key={s._id}
                        className="hover:bg-slate-900/80 transition-colors cursor-pointer"
                        onClick={() => navigate(`/admin/students/${s._id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-slate-100 font-medium">
                          {s.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                          {s.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                          {s.enrollmentNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                          {s.course}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                          {s.semester}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                          {s.admissionYear || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-slate-300">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/students/edit/${s._id}`);
                            }}
                            className="inline-flex items-center rounded-full bg-cyan-500/90 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-16 text-center text-slate-400">
                <p className="text-2xl font-semibold mb-2">
                  No students match the filters
                </p>
                <p>
                  Try resetting filters or check the student registration list.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
