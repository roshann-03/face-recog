const { app } = require("./app.js");
const { connectDB } = require("./db.config");
const PORT = process.env.PORT || 5000;

const MAX_RETRIES = 5;
let attempts = 0;

const startServer = async () => {
  try {
    attempts++;
    await connectDB();
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(`Server start failed (attempt ${attempts}):`, err.message);
    if (attempts < MAX_RETRIES) {
      console.log("Retrying in 5 seconds...");
      setTimeout(startServer, 5000);
    } else {
      console.error("Max retries reached. Exiting with status 1.");
      process.exit(1);
    }
  }
};

// Listen for unhandled promise rejections and uncaught exceptions
process.on("unhandledRejection", (err) => {
  //.error("Unhandled Rejection:", err);
});
process.on("uncaughtException", (err) => {
  //.error("Uncaught Exception:", err);
  process.exit(1);
});

// Start the server
startServer();
