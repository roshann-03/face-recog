const User = require("../models/user.model.js");
const OTP = require("../models/otp.model.js");
const {
  comparePassword,
  hashPassword,
} = require("../utils/passwordHashing.util.js");
const { generateToken } = require("../utils/generateToken.util.js");
const {
  generateOTP,
  encryptOTP,
  verifyOTP,
} = require("../utils/generateOTP.util.js");
const { sendEmail } = require("../utils/transporter.util.js");
const validator = require("validator");

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    if (!validator.isEmail(email))
      return res.status(400).json({ message: "Invalid email" });

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    const message = `<html>
    <body>
    <p>Hello ${user.name || "User"},</p>
    <p>Someone just logged into your account at ${new Date().toLocaleString()}.</p>
    <p>If this wasn't you, please reset your password immediately.</p>
    </body>
    </html>
  `;

    res.json({ token, user });
    await sendEmail(email, "Login Notification", message);
  } catch (err) {
    //.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Request OTP for password reset
exports.requestOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!validator.isEmail(email))
      return res.status(400).json({ message: "Invalid email" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    const hashedOtp = encryptOTP(otp);

    const otpDoc = new OTP({
      userId: user._id,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins expiry
    });

    await otpDoc.save();
    await sendEmail(
      email,
      "Your OTP for Password Reset",
      `Your OTP is: ${otp}`
    );

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    //.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Verify OTP and reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res
        .status(400)
        .json({ message: "Email, OTP, and new password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otpDoc = await OTP.findOne({ userId: user._id }).sort({
      createdAt: -1,
    });
    if (!otpDoc || otpDoc.expiresAt < new Date())
      return res.status(400).json({ message: "OTP expired" });

    const isValidOtp = verifyOTP(otp, otpDoc.otp);
    if (!isValidOtp) return res.status(400).json({ message: "Invalid OTP" });

    user.password = await hashPassword(newPassword);
    await user.save();

    // Remove all OTPs for this user after successful reset
    await OTP.deleteMany({ userId: user._id });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    //.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
