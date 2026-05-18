const express = require("express");
const router = express.Router();
const { runOrchestrator } = require("../orchestrator/orchestrator");

// POST /api/orchestrate
router.post("/", async (req, res) => {
  const { message } = req.body;

  if (message === undefined) {
    return res.status(400).json({
      success: false,
      error: "Message is required"
    });
  }

  if (typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "Message khaali nahi ho sakta"
    });
  }

  try {
    const result = await runOrchestrator(message.trim());
    return res.status(200).json(result);
  } catch (error) {
    console.error("Orchestrator Route Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to execute orchestration strategy"
    });
  }
});

module.exports = router;
