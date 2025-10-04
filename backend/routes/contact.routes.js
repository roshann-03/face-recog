const express = require("express");
const rateLimit = require("express-rate-limit");
const Contact = require("../models/contact.model");
const auth = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");

const router = express.Router();

// Rate limiting: 5 requests per 15 min per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many queries. Please try again later." },
});

// POST: Student sends query
router.post("/", contactLimiter, async (req, res) => {
  try {
    const { name, enrollmentNumber, course, semester, message } = req.body;

    if (!name || !enrollmentNumber || !course || !semester || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newQuery = new Contact({
      name,
      enrollmentNumber,
      course,
      semester,
      message,
    });

    await newQuery.save();
    res.status(201).json({ message: "Query submitted successfully" });
  } catch (err) {
    //.error(err);
    res.status(500).json({ error: "Server error", message: err });
  }
});

// GET: Admin fetches all queries
router.get("/", auth, authorize(["admin"]), async (req, res) => {
  try {
    const queries = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(queries);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE: Admin deletes a query
router.delete("/:id", auth, authorize(["admin"]), async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Query not found" });
    res.json({ message: "Query deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
