import { useEffect, useState } from "react";
import { API_ONE } from "../api/api";

export default function AdminQueries() {
  const [queries, setQueries] = useState([]);
  const [filteredQueries, setFilteredQueries] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await API_ONE.get("/contact", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!Array.isArray(data)) {
        throw new Error("Unexpected response format: expected an array");
      }

      setQueries(data);
      setFilteredQueries(data);
    } catch (err) {
      //.error(err);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch queries";
      setMessage(errorMsg);
      setIsError(true);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const handleSearch = (searchTerm) => {
    if (!Array.isArray(queries)) return;
    const filtered = queries.filter(
      (q) =>
        q.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.enrollmentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredQueries(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this query?")) return;

    try {
      const token = localStorage.getItem("token");
      const { data } = await API_ONE.delete(`/contact/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(data.message || "Query deleted successfully");
      setIsError(false);

      // Remove deleted query from state
      const updatedQueries = queries.filter((q) => q._id !== id);
      setQueries(updatedQueries);
      setFilteredQueries(updatedQueries);

      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      //.error(err);
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
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">
        Student Queries
      </h1>

      {message && (
        <p
          className={`text-center font-bold ${
            isError ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}

      <input
        type="text"
        placeholder="Search by name, message, course, or enrollment number"
        onChange={(e) => handleSearch(e.target.value)}
        className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full md:w-1/2 mb-4"
      />

      {filteredQueries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQueries.map((q) => (
            <div
              key={q._id}
              className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition relative"
            >
              <button
                onClick={() => handleDelete(q._id)}
                className="absolute top-2 right-2 text-red-600 hover:text-red-800 font-bold"
              >
                Delete
              </button>
              <p className="font-semibold text-gray-800 mb-1">{q.name}</p>
              <p className="text-gray-500 text-sm mb-1">
                Enrollment: {q.enrollmentNumber} | Semester: {q.semester}
              </p>
              <p className="text-gray-700 mb-1">Course: {q.course}</p>
              <p className="text-gray-700 mb-1">Email: {q.email}</p>
              <p className="text-gray-600">Message: {q.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No queries found.</p>
      )}
    </div>
  );
}
