require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Import Routes
const routes = require("./routes/routes");
const contactRoutes = require("./routes/contact.routes");
const morgan = require("morgan");

const app = express();
app.use(morgan("dev"));
// Middleware
const corsOptions = {
  origin: [process.env.FRONTEND_URL,"http://localhost:5173", "http://localhost:5001"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions)); // handles OPTIONS for all routes

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api", routes);
app.use("/api/contact", contactRoutes);

// Handle 404 - Not Found
app.use((req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  //.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong on the server";

  res.status(statusCode).json({
    status: "error",
    message,
  });
});

module.exports = { app };
