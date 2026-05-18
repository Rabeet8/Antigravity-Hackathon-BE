const express = require("express");
const router = express.Router();
const { runNERAgent } = require("../agents/nerAgent");

// POST /api/ner/extract
router.post("/extract", async (req, res) => {
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
      error: "Message cannot be empty"
    });
  }

  try {
    const result = await runNERAgent(message.trim());
    return res.status(200).json(result);
  } catch (error) {
    console.error("NER Route Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to execute NER Agent extraction"
    });
  }
});

module.exports = router;
