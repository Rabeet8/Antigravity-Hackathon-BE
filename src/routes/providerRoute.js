const express = require("express");
const router = express.Router();
const { runSearchAgent } = require("../agents/searchAgent");

// POST /api/providers/search
router.post("/search", async (req, res) => {
  const { service_type, location, time_normalized } = req.body;

  try {
    const result = await runSearchAgent({
      service_type,
      location,
      time_normalized
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error("Provider Route Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to execute Search Agent"
    });
  }
});

module.exports = router;
