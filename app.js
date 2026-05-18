const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// Route imports
const orchestrateRoute = require("./src/routes/orchestrateRoute");
const nerRoute = require("./src/routes/nerRoute");
const providerRoute = require("./src/routes/providerRoute");
const bookingRoute = require("./src/routes/bookingRoute");
const reminderRoute = require("./src/routes/reminderRoute");

const app = express();

// Middleware (CORS development settings + 10MB JSON limits as per requirements)
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev")); // Logging middleware

// API Routes Mounting
app.use("/api/orchestrate", orchestrateRoute);
app.use("/api/ner", nerRoute);
app.use("/api/providers", providerRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/reminders", reminderRoute);

// GET /api/health
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "Kaam Karo API",
    version: "1.0.0"
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found"
  });
});

module.exports = app;
