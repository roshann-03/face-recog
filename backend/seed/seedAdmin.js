//seed admin
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/user.model.js");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASS = process.env.ADMIN_PASS;
console.log("admin env cred. ", ADMIN_EMAIL, " ", ADMIN_PASS);
if (!ADMIN_EMAIL || !ADMIN_PASS) {
  console.error("Please set ADMIN_EMAIL and ADMIN_PASS in .env");
  process.exit(1);
}

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI, { dbName: "face-recog" });
    let admin = await User.findOne({ email: ADMIN_EMAIL });
    if (admin) {
      console.log("Admin found. Updating existing record...");
      // Update properties
      admin.name = "Admin";
      admin.password = ADMIN_PASS; // The pre-save hook will re-hash this
      admin.role = "admin";
    } else {
      console.log("Admin not found. Creating new record...");
      // Create a new instance
      admin = new User({
        name: "Admin",
        email: ADMIN_EMAIL,
        password: ADMIN_PASS,
        role: "admin",
      });
    }

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
