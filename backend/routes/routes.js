const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware.js");
const authorize = require("../middleware/authorize.middleware.js");
const authController = require("../controllers/auth.controller.js");
const studentController = require("../controllers/admin.controller.js");
const attendanceController = require("../controllers/attendance.controller.js");
const multer = require("multer");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user.model.js");
const crypto = require("crypto");
const { sendEmail } = require("../utils/transporter.util.js");
const rateLimit = require("express-rate-limit");
// Temp storage in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many queries. Please try again later." },
});
const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1,
  message: { error: "Too many queries. Please try again later." },
});
// Auth
router.post("/login", loginLimiter, catchAsync(authController.login));
// router.post("/request-otp", catchAsync(authController.requestOTP));
// router.post("/reset-password", catchAsync(authController.resetPassword));

router.post("/forgot-password", forgotLimiter, async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 3600000; // 1 hour expiry

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expiry;
    await user.save({ validateBeforeSave: false });

    // Send email
    // backend: forgot-password route
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5175"; // fallback

    const resetLink = `${frontendUrl}/reset-password/${token}`;

    await sendEmail(
      email,
      "Password Reset",
      `<html><body><p>Click <a href="${resetLink}">here</a> to reset your password.</p></body></html>`
    );

    res.json({ message: "Reset link sent to your email" });
  } catch (err) {
    //.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /reset-password/:token
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save({ validateBeforeSave: false });

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    //.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin routes
router
  .route("/admins")
  .get(auth, authorize(["admin"]), studentController.getAllAdmins)
  .post(auth, authorize(["admin"]), studentController.createAdmin);

// DELETE admin
router.delete(
  "/admins/:id",
  auth,
  authorize(["admin"]),
  catchAsync(studentController.deleteAdmin)
);

// Student CRUD (Admin only)
router.post(
  "/students",
  auth,
  authorize(["admin"]),
  upload.single("photo"),
  catchAsync(studentController.createStudent)
);
router.get(
  "/students",
  auth,
  authorize(["admin"]),
  catchAsync(studentController.getAllStudents)
);
router.get(
  "/students/:id",
  auth,
  authorize(["admin"]),
  catchAsync(studentController.getStudent)
);
router.put(
  "/students/:id",
  auth,
  authorize(["admin"]),
  catchAsync(studentController.updateStudent)
);
router.delete(
  "/students/:id",
  auth,
  authorize(["admin"]),
  catchAsync(studentController.deleteStudent)
);







// Attendance routes
router.post(
  "/attendance/scan",
  auth,
  authorize(["admin"]),
  catchAsync(attendanceController.scanAndMarkAttendance)
);
router.get(
  "/attendance/student/:id",
  auth,
  catchAsync(attendanceController.getAttendanceByStudent)
);
// Admin view of all students’ attendance
router.get(
  "/attendance/all",
  auth,
  authorize(["admin"]),
  catchAsync(attendanceController.getAllAttendance)
);

// Auth route
router.get(
  "/auth/me",
  auth,
  catchAsync(async (req, res) => {
    res.json(req.user);
  })
);

module.exports = router;
