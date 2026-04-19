import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { API_ONE } from "../api/api";

export default function AdminQueries() {
  const [queries, setQueries] = useState([]);
  const [filteredQueries, setFilteredQueries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const { data } = await API_ONE.get("/contact");
      if (!Array.isArray(data)) {
        throw new Error("Unexpected response format: expected an array");
      }
      setQueries(data);
      setFilteredQueries(data);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch queries";
      setMessage(errorMsg);
      setIsError(true);
      setTimeout(() => setMessage(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredQueries(queries);
      return;
    }

    const lower = value.toLowerCase();
    setFilteredQueries(
      queries.filter(
        (q) =>
          q.name?.toLowerCase().includes(lower) ||
          q.message?.toLowerCase().includes(lower) ||
          q.course?.toLowerCase().includes(lower) ||
          q.enrollmentNumber?.toLowerCase().includes(lower),
      ),
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this query?")) return;

    try {
      const { data } = await API_ONE.delete(`/contact/${id}`);
      setMessage(data.message || "Query deleted successfully");
      setIsError(false);
      const updated = queries.filter((q) => q._id !== id);
      setQueries(updated);
      setFilteredQueries(updated);
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to delete query";
      setMessage(errorMsg);
      setIsError(true);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass border border-cyan-500/20 rounded-3xl p-8 mb-8"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300 mb-2">
                Admin Queries
              </p>
              <h1 className="text-4xl font-black text-white">
                Student Support Messages
              </h1>
              <p className="text-slate-400 mt-2">
                Review incoming student queries and remove handled requests.
              </p>
            </div>
            <div className="text-slate-300">
              <p className="text-sm">
                Showing {filteredQueries.length} of {queries.length}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name, message, course, or enrollment"
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </motion.div>

        {message && (
          <div
            className={`rounded-3xl p-4 mb-6 text-center font-semibold ${
              isError
                ? "bg-red-500/10 text-red-300 border border-red-500/20"
                : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
            }`}
          >
            {message}
          </div>
        )}

        <div className="glass border border-slate-700/80 rounded-3xl overflow-hidden">
          <div className="bg-slate-950/90 px-6 py-5 border-b border-slate-700/80">
            <h2 className="text-xl font-semibold text-white">Query Inbox</h2>
          </div>
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              Loading queries...
            </div>
          ) : filteredQueries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-900 text-slate-400">
                  <tr>
                    {[
                      "Name",
                      "Enrollment",
                      "Course",
                      "Semester",
                      "Email",
                      "Message",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950">
                  {filteredQueries.map((q) => (
                    <tr
                      key={q._id}
                      className="hover:bg-slate-900/80 transition-colors"
                    >
                      <td className="px-6 py-4 text-slate-100 font-medium">
                        {q.name}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {q.enrollmentNumber}
                      </td>
                      <td className="px-6 py-4 text-slate-400">{q.course}</td>
                      <td className="px-6 py-4 text-slate-400">{q.semester}</td>
                      <td className="px-6 py-4 text-slate-400">{q.email}</td>
                      <td className="px-6 py-4 text-slate-300">{q.message}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(q._id)}
                          className="rounded-full bg-red-500/90 px-4 py-2 text-xs font-semibold text-white hover:bg-red-400 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center text-slate-400">
              <p className="text-2xl font-semibold mb-2">No queries found</p>
              <p>Try adjusting the search term or check again later.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
