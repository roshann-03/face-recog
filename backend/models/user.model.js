const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Invalid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["admin", "student"],
      default: "student",
      required: true,
    },

    // Student-specific fields
    enrollmentNumber: {
      type: String,
      required: function () {
        return this.role === "student";
      },
      trim: true,
    },
    admissionYear: {
      type: Number,
      required: function () {
        return this.role === "student";
      },
      min: 2000,
      max: new Date().getFullYear(),
    },
    course: {
      type: String,
      required: function () {
        return this.role === "student";
      },
      trim: true,
    },
    semester: {
      type: Number,
      required: function () {
        return this.role === "student";
      },
      min: 1,
      max: 12,
    },
    fatherName: {
      type: String,
      required: function () {
        return this.role === "student";
      },
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: function () {
        return this.role === "student";
      },
      match: [/^\+?\d{10,15}$/, "Invalid phone number"],
    },

    // Face encoding
    faceEncoding: { type: [Number] },

    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await hashPassword(this.password);
  }
  next();
});

userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.password) {
    update.password = await hashPassword(update.password);
    this.setUpdate(update);
  }
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  // `this.password` may be undefined if not selected
  if (!this.password) throw new Error("Password not available");
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.index(
  { enrollmentNumber: 1 },
  { unique: true, partialFilterExpression: { role: "student" } }
);
module.exports = mongoose.model("User", userSchema);
