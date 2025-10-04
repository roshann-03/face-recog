const mongoose = require("mongoose");
const User = require("../models/user.model.js");
const Attendance = require("../models/attendance.model.js");
const axios = require("axios");

// // --- Scan & Mark Attendance ---
// const scanAndMarkAttendance = async (req, res) => {
//   try {
//     const { image } = req.body;
//     if (!image) return res.status(400).json({ message: "Image is required" });

//     // Send image to Python microservice for face recognition
//     const { data } = await axios.post(`${process.env.FACE_API}/recognize`, {
//       image,
//     });

//     const recognizedStudents = data.students || [];
//     if (recognizedStudents.length === 0) {
//       return res.json({ message: "No students recognized", students: [] });
//     }

//     // Define today's date range (midnight → 23:59:59)
//     const startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0);
//     const endOfDay = new Date();
//     endOfDay.setHours(23, 59, 59, 999);

//     let markedStudents = [];
//     let alreadyMarked = [];

//     for (let name of recognizedStudents) {
//       const student = await User.findOne({ name, role: "student" });
//       if (!student) continue;

//       // Ensure we query with ObjectId
//       const studentId = new mongoose.Types.ObjectId(student._id);

//       // Check if attendance already marked today
//       const existing = await Attendance.findOne({
//         student: studentId,
//         date: { $gte: startOfDay, $lte: endOfDay },
//       });

//       if (!existing) {
//         await Attendance.create({
//           student: studentId, // ✅ consistent with schema
//           date: new Date(),
//           status: "present",
//           recognizedBy: req.user._id,
//         });
//         markedStudents.push(student.name);
//       } else {
//         alreadyMarked.push(student.name);
//       }
//     }

//     // Build message
//     let message = "";
//     if (markedStudents.length > 0) {
//       message += `✅ Attendance marked for: ${markedStudents.join(", ")}. `;
//     }
//     if (alreadyMarked.length > 0) {
//       message += `ℹ️ Already marked today: ${alreadyMarked.join(", ")}.`;
//     }

//     res.json({
//       message: message || "No students recognized",
//       students: recognizedStudents,
//     });
//   } catch (err) {
//     console.error("Attendance scan error:", err);
//     res.status(500).json({ message: "Recognition failed", error: err.message });
//   }
// };

// --- Get Attendance by Student ---
const getAttendanceByStudent = async (req, res) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.params.id);

    const records = await Attendance.find({ student: studentId })
      .sort({ date: -1 })
      .populate("recognizedBy", "name email");

    if (!records || records.length === 0) {
      return res.status(404).json({ message: "No attendance records found" });
    }

    res.json({ studentId, attendance: records });
  } catch (error) {
    // console.error("Error fetching attendance:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Get Attendance for All Students ---
const getAllAttendance = async (req, res) => {
  try {
    // Fetch all students
    const students = await User.find({ role: "student" });
    const allAttendance = [];

    for (const s of students) {
      // Fetch all attendance records for this student and populate references
      const records = await Attendance.find({ student: s._id })
        .sort({ date: -1 })
        .populate("student", "name email")
        .populate("recognizedBy", "name email");

      allAttendance.push({
        student: s,
        attendance: records,
      });
    }

    res.json(allAttendance);
  } catch (err) {
    // console.error("Error fetching all attendance:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  // scanAndMarkAttendance,
  getAttendanceByStudent,
  getAllAttendance,
};
