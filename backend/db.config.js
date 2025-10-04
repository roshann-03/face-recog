const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";

const connectDB = async () => {
  // try {
    await mongoose.connect(MONGO_URI, {
      dbName: "face-recog",
    });

    //.log("✅ MongoDB Connected");

  //   // Connection event listeners
  //   mongoose.connection.on("connected", () => {
  //     //.log("MongoDB connection established");
  //   });

  //   mongoose.connection.on("error", (err) => {
  //     //.error("MongoDB connection error:", err);
  //   });

  //   mongoose.connection.on("disconnected", () => {
  //     //.warn("MongoDB disconnected");
  //   });

  //   // Optional: reconnect on disconnect
  //   mongoose.connection.on("reconnected", () => {
  //     //.log("MongoDB reconnected");
  //   });
  // // } catch (err) {
  // //   //.error("Failed to connect to MongoDB:", err.message);
  // //   process.exit(1);
  // // }
};

module.exports = { connectDB };
