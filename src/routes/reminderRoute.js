const express = require("express");
const router = express.Router();
const { runReminderAgent } = require("../agents/reminderAgent");

// POST /api/reminders/schedule
router.post("/schedule", async (req, res) => {
  const { booking_id, appointment_date, appointment_time, provider_name } = req.body;

  if (!booking_id) {
    return res.status(400).json({
      success: false,
      error: "booking_id is required"
    });
  }

  try {
    const result = await runReminderAgent({
      booking_id,
      appointment_date,
      appointment_time,
      provider_name
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error("Reminder Route Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to execute Reminder Agent"
    });
  }
});

module.exports = router;
