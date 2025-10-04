import { useState } from "react";

import { API_ONE } from "../api/api";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    enrollmentNumber: "",
    course: "",
    semester: "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [blockButton, setBlockButton] = useState(false);
  const [error, setError] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Submitting...");
    setBlockButton(true);
    try {
      const res = await fetch(`${API_ONE}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message?.message || "Error submitting query");

      setError(false);
      setStatus("Your query has been submitted!");
      setForm({
        name: "",
        enrollmentNumber: "",
        course: "",
        semester: "",
        message: "",
      });
    } catch (err) {
      setStatus(err.message);
      setError(true);
    } finally {
      setBlockButton(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
        Contact / Query Form
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          required
        />
        <input
          name="enrollmentNumber"
          value={form.enrollmentNumber}
          onChange={handleChange}
          placeholder="Enrollment No."
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          required
        />
        <input
          name="course"
          value={form.course}
          onChange={handleChange}
          placeholder="Course"
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          required
        />
        <input
          type="number"
          name="semester"
          value={form.semester}
          onChange={handleChange}
          placeholder="Semester"
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          required
        />
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Write your query..."
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition resize-none"
          rows="4"
          required
        />

        <button
          type="submit"
          disabled={blockButton}
          className={`col-span-1 w-full py-2 rounded-lg text-white font-semibold transition ${
            blockButton
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {blockButton ? "Submitting..." : "Submit"}
        </button>
      </form>

      {status && (
        <p
          className={`mt-4 text-center text-sm font-medium ${
            error ? "text-red-600" : "text-green-600"
          } transition`}
        >
          {status}
        </p>
      )}
    </div>
  );
}
