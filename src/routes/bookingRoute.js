const express = require("express");
const router = express.Router();
const { runBookingAgent } = require("../agents/bookingAgent");
const mockBookings = require("../data/mockBookings");

// POST /api/bookings/create
router.post("/create", async (req, res) => {
  const { provider_id, service_type, location, time_normalized } = req.body;

  if (!provider_id) {
    return res.status(400).json({
      success: false,
      error: "provider_id is required"
    });
  }

  try {
    const result = await runBookingAgent({
      provider_id,
      service_type,
      location,
      time_normalized
    });

    // Dynamically append to booking history array so it shows up in history screen!
    if (result.status === "success") {
      mockBookings.unshift({
        booking_id: result.output.booking_id,
        service: result.output.receipt.service,
        provider_id: result.output.provider.id,
        provider_name: result.output.provider.name,
        date: result.output.appointment.date,
        time: result.output.appointment.time,
        location: result.output.appointment.location,
        status: "Upcoming",
        reminder_sent: false
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Booking Route Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to execute Booking Agent"
    });
  }
});

// GET /api/bookings/history
router.get("/history", (req, res) => {
  return res.status(200).json(mockBookings);
});

module.exports = router;
