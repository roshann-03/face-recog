const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Session title, e.g., "Math Lecture"
    subject: { type: String, required: true }, // Subject name
    location: { type: String, required: true }, // Classroom or online link
    day: { type: String, required: true }, // e.g., "Monday"
    startTime: { type: Date, required: true }, // Session start datetime
    endTime: { type: Date, required: true }, // Session end datetime
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Who created the session
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Students attending
  },
  { timestamps: true }
); // Automatically adds createdAt & updatedAt

module.exports = mongoose.model("Session", sessionSchema);
