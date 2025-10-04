import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_ONE } from "../api/api.js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState({});
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    fetchStudent();
    fetchAttendance();
  }, [id]);

  const fetchStudent = async () => {
    const { data } = await API_ONE.get(`/students/${id}`);
    setStudent(data);
  };

  const fetchAttendance = async () => {
    const { data } = await API_ONE.get(`/attendance/student/${id}`);

    setAttendance(data?.attendance || []);
  };

  const chartData = [...attendance]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((a) => ({
      date: new Date(a.date).toLocaleDateString(),
      present: a.status === "present" ? 1 : 0,
    }));

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-indigo-700">{student.name}</h1>
      <div className="bg-white p-6 rounded-xl shadow space-y-2">
        <p>Email: {student.email}</p>
        <p>Enrollment No: {student.enrollmentNumber}</p>
        <p>Course: {student.course}</p>
        <p>Semester: {student.semester}</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Attendance</h2>
        {attendance.length === 0 ? (
          <p>No attendance records yet.</p>
        ) : (
          <>
            <table className="w-full border-collapse border">
              <thead>
                <tr>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((a) => (
                  <tr key={a._id}>
                    <td className="border p-2">
                      {new Date(a.date).toLocaleDateString()}
                    </td>
                    <td
                      className={`border p-2 ${
                        a.status === "present"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {a.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6">
              <h3 className="text-lg font-semibold">Attendance Graph</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid stroke="#ccc" />
                  <Tooltip />
                  <Line type="monotone" dataKey="present" stroke="#4f46e5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
