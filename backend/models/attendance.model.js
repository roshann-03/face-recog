const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    status: { type: String, enum: ["present", "absent"], default: "absent" },
    recognizedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin who marked
  },
  { timestamps: true }
); // automatically adds createdAt and updatedAt

module.exports = mongoose.model("Attendance", attendanceSchema, "attendance");
