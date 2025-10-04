//seed admin
const { config } = require("dotenv");
config({ path: "../.env" });
const mongoose = require("mongoose");
const User = require("../models/user.model.js");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASS = process.env.ADMIN_PASS;

if (!ADMIN_EMAIL || !ADMIN_PASS) {
  console.error("Please set ADMIN_EMAIL and ADMIN_PASS in .env");
  process.exit(1);
}

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI, { dbName: "face-recog" });

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log("Admin already exists:", existing.email);
      process.exit(0);
    }

    const admin = new User({
      name: "Admin",
      email: ADMIN_EMAIL,
      password: ADMIN_PASS, // plain text; pre-save hook will hash it
      role: "admin",
    });

    await admin.save(); // triggers pre-save hook
    console.log("Admin created successfully!");
    console.log({ email: admin.email, password: "Admin@1234" });
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
