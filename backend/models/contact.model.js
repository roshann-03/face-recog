const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  enrollmentNumber: { type: String, required: true, trim: true },
  course: { type: String, required: true, trim: true },
  semester: { type: Number, required: true, min: 1, max: 12 },
  message: { type: String, required: true, trim: true, minlength: 5 },

  createdAt: { type: Date, default: Date.now },
});
contactSchema.index({ createdAt: 1 });

module.exports = mongoose.model("Contact", contactSchema);
