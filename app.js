const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const nerRoutes = require("./src/routes/nerRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev")); // Logging middleware

// Routes
app.use("/api/ner", nerRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found"
  });
});

module.exports = app;
