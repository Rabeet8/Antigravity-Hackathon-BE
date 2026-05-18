const providers = require("../data/mockProviders");

/**
 * Booking Agent implementation
 */
const runBookingAgent = async (input) => {
  const timestamp = new Date().toISOString();
  const { provider_id, service_type, location, time_normalized } = input;

  console.log(`[STEP 4 - BOOKING] Creating booking for ${provider_id}...`);

  // Find the provider in the database
  const p = providers.find(item => item.id === provider_id) || {
    id: provider_id,
    name: "Independent Technician",
    contact: "0300-0000000",
    rating: 4.5,
    available_slots: ["10:00 AM"],
    price_range: "PKR 1000-2000"
  };

  // Determine slot (first available, fallback to 10:00 AM)
  const slot = (p.available_slots && p.available_slots.length > 0) 
    ? p.available_slots[0] 
    : "10:00 AM";

  // Calculate Date and Day of the Week dynamically based on normalized time
  const today = new Date();
  let bookingDate = new Date(today);
  
  if (time_normalized && time_normalized.toLowerCase().includes("tomorrow")) {
    bookingDate.setDate(today.getDate() + 1);
  } else if (time_normalized && time_normalized.toLowerCase().includes("day after tomorrow")) {
    bookingDate.setDate(today.getDate() + 2);
  }

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const dayName = daysOfWeek[bookingDate.getDay()];
  const formattedDate = bookingDate.toISOString().split("T")[0]; // YYYY-MM-DD
  const receiptSlot = `${bookingDate.getDate()} ${months[bookingDate.getMonth()]} ${bookingDate.getFullYear()}, ${slot}`;

  // Generate Booking ID: KK-YYYYMMDD-XXX
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const randomSuffix = String(Math.floor(100 + Math.random() * 900)); // 3-digit random suffix
  const booking_id = `KK-${yyyy}${mm}${dd}-${randomSuffix}`;

  const confirmation_message = `Aapki booking confirm ho gayi! ${p.name} ${time_normalized && time_normalized.includes("tomorrow") ? "kal" : "aaj"} subah ${slot} pe aayega.`;

  console.log(`[STEP 4 - BOOKING] Confirmed: ${booking_id} at ${slot} ✓`);

  return {
    step: 4,
    agent: "Booking_Agent",
    input: {
      provider_id,
      service_type,
      user_location: location,
      requested_time: time_normalized
    },
    output: {
      booking_id,
      status: "confirmed",
      provider: {
        id: p.id,
        name: p.name,
        contact: p.contact,
        rating: p.rating
      },
      appointment: {
        date: formattedDate,
        day: dayName,
        time: slot,
        location: `${location || "G-13"}, Islamabad`
      },
      confirmation_message,
      receipt: {
        service: service_type || "Service",
        provider: p.name,
        slot: receiptSlot,
        booking_ref: booking_id,
        estimated_cost: p.price_range || "PKR 1000-2000",
        payment_method: "Cash on Service"
      }
    },
    status: "success",
    timestamp
  };
};

module.exports = {
  runBookingAgent
};
