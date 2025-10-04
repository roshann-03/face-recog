const User = require("../models/user.model.js");
const validator = require("validator");

// Create a new admin (only accessible by existing admins)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    if (!validator.isEmail(email))
      return res.status(400).json({ message: "Invalid email" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    const admin = await User.create({
      name,
      email,
      password,
      role: "admin",
    });

    res.status(201).json({ message: "Admin created successfully", admin });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Get all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");
    res.json(admins);
  } catch (err) {
    
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create student
exports.createStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });
    if (!validator.isEmail(email))
      return res.status(400).json({ message: "Invalid email" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    const student = await User.create({
      name,
      email,
      password,
      role: "student",
    });
    res.json(student);
  } catch (err) {
    
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password");
    res.json(students);
  } catch (err) {
    
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get student by ID
exports.getStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select("-password");
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const { name, email } = req.body;
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (name) student.name = name;
    if (email) {
      if (!validator.isEmail(email))
        return res.status(400).json({ message: "Invalid email" });
      student.email = email;
    }

    await student.save();
    res.json(student);
  } catch (err) {
    // console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await User.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student deleted" });
  } catch (err) {
    // console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Upload student image and store encoding
exports.uploadFaceImage = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { image } = req.body; // base64 image from frontend

    if (!image) return res.status(400).json({ message: "Image required" });

    // Get embedding
    const embeddings = await getFaceEmbedding(image);
    if (embeddings.length === 0)
      return res.status(400).json({ message: "No face detected" });

    // Save first detected face embedding
    await User.findByIdAndUpdate(studentId, {
      faceEncoding: embeddings[0],
    });

    res.json({ message: "Face encoding saved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
