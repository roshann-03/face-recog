import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { API_ONE } from "../api/api.js";

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
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(true);

  const fetchAllAttendance = async () => {
    try {
      const { data } = await API_ONE.get("/attendance/all");
      setAllAttendance(data);
      setFilteredAttendance(data);
    } catch (err) {
      setMessage("Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAttendance();
  }, []);

  useEffect(() => {
    let filtered = [...allAttendance];

    if (filters.course) {
      filtered = filtered.filter(
        ({ student }) => student.course.toUpperCase() === filters.course,
      );
    }

    if (filters.semester) {
      filtered = filtered.filter(
        ({ student }) => student.semester === Number(filters.semester),
      );
    }

    if (filters.name) {
      filtered = filtered.filter(({ student }) =>
        student.name.toLowerCase().includes(filters.name.toLowerCase()),
      );
    }

    if (filters.startDate || filters.endDate) {
      const start = filters.startDate ? new Date(filters.startDate) : null;
      const end = filters.endDate ? new Date(filters.endDate) : null;

      filtered = filtered.filter(({ attendance }) =>
        attendance?.some((record) => {
          const date = new Date(record.date);
          if (start && date < start) return false;
          if (end && date > end) return false;
          return true;
        }),
      );
    }

    setFilteredAttendance(filtered);
  }, [filters, allAttendance]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));

    if (name === "course") {
      setFilters((prev) => ({ ...prev, semester: "", course: value }));
    }
  };

  const clearFilters = () => {
    setFilters({
      course: "",
      semester: "",
      name: "",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass border border-cyan-500/20 rounded-3xl p-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300 mb-2">
                Attendance Dashboard
              </p>
              <h1 className="text-4xl font-black text-white">
                All Students Attendance
              </h1>
              <p className="text-slate-400 mt-2">
                Filter attendance lists by student, course, semester, or date
                range.
              </p>
            </div>
            <button
              onClick={clearFilters}
              className="rounded-2xl border border-slate-700/80 bg-slate-900/80 px-5 py-3 text-slate-200 font-semibold hover:bg-slate-800 transition"
            >
              Reset Filters
            </button>
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-[1.5fr_1fr_1fr]">
            <input
              type="text"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              placeholder="Search student name"
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
            />
            <select
              name="course"
              value={filters.course}
              onChange={handleFilterChange}
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none"
            >
              <option value="">All Courses</option>
              {Object.keys(courseSemesters).map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
            <select
              name="semester"
              value={filters.semester}
              onChange={handleFilterChange}
              disabled={!filters.course}
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-900/60"
            >
              <option value="">All Semesters</option>
              {filters.course &&
                Array.from(
                  { length: courseSemesters[filters.course] },
                  (_, i) => i + 1,
                ).map((semester) => (
                  <option key={semester} value={semester}>
                    {semester}
                  </option>
                ))}
            </select>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
            <div className="col-span-1 sm:col-span-2 xl:col-span-2 flex items-center justify-end gap-4">
              <span className="text-sm text-slate-400">
                Showing {filteredAttendance.length} records
              </span>
            </div>
          </div>
        </motion.div>

        {message && (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-center text-red-300">
            {message}
          </div>
        )}

        <div className="glass border border-slate-700/80 rounded-3xl overflow-hidden">
          <div className="bg-slate-950/90 px-6 py-5 border-b border-slate-700/80">
            <h2 className="text-xl font-semibold text-white">
              Attendance Records
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">
              Loading attendance records...
            </div>
          ) : filteredAttendance.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <p className="text-2xl font-semibold mb-2">
                No attendance records found
              </p>
              <p>Adjust the filters to show matching student attendance.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-900 text-slate-400">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                      Semester
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                      Attendance Count
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                      Recent Status
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold uppercase tracking-wider">
                      Profile
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950">
                  {filteredAttendance.map(({ student, attendance }) => {
                    const latest = attendance?.[attendance.length - 1];
                    return (
                      <tr
                        key={student._id}
                        className="hover:bg-slate-900/80 transition-colors"
                      >
                        <td className="px-6 py-4 text-slate-100 font-medium">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {student.course}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {student.semester}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {attendance?.length || 0}
                        </td>
                        <td className="px-6 py-4">
                          {latest ? (
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${latest.status === "present" ? "bg-green-500/20 text-green-300 border border-green-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"}`}
                            >
                              {latest.status}
                            </span>
                          ) : (
                            <span className="text-slate-500">No records</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/admin/students/${student._id}`}
                            className="rounded-full bg-cyan-500/90 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
