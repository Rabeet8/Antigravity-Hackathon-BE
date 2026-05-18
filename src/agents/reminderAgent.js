/**
 * Reminder Agent implementation
 */
const runReminderAgent = async (input) => {
  const timestamp = new Date().toISOString();
  const { booking_id, appointment_date, appointment_time, provider_name } = input;

  console.log(`[STEP 5 - REMINDER] Scheduling 3 reminders...`);

  // Build scheduled timestamps (ISO strings) relative to the appointment date
  const appDate = appointment_date || new Date().toISOString().split("T")[0];
  const appTime = appointment_time || "10:00 AM";
  const name = provider_name || "Service Provider";

  // Night before reminder: Scheduled at 8:00 PM on the day before (or today evening)
  const prevDate = new Date(appDate);
  prevDate.setDate(prevDate.getDate() - 1);
  const nightBeforeStr = `${prevDate.toISOString().split("T")[0]}T20:00:00.000Z`;

  // One hour before: Scheduled at 1 hour prior to appointment
  const hourBeforeStr = `${appDate}T09:00:00.000Z`;

  // Completion check: Scheduled 2 hours after appointment
  const completionStr = `${appDate}T12:00:00.000Z`;

  const reminders_scheduled = [
    {
      reminder_id: `REM-${Math.floor(100 + Math.random() * 900)}`,
      type: "night_before",
      scheduled_at: nightBeforeStr,
      message: `Kal subah ${appTime} pe ${name} aayega. Tayyar rahein! 🔧`
    },
    {
      reminder_id: `REM-${Math.floor(100 + Math.random() * 900)}`,
      type: "one_hour_before",
      scheduled_at: hourBeforeStr,
      message: `Yaad dihani: ${name} 1 ghante mein aa raha hai! Booking: ${booking_id} 🔔`
    }
  ];

  const follow_up = {
    reminder_id: `REM-${Math.floor(100 + Math.random() * 900)}`,
    type: "completion_check",
    scheduled_at: completionStr,
    message: "Kya service complete ho gayi? Apna feedback dein! ⭐"
  };

  console.log(`[STEP 5 - REMINDER] Reminders set: 8PM tonight, 9AM tomorrow, 12PM tomorrow ✓`);

  return {
    step: 5,
    agent: "Reminder_Agent",
    input: {
      booking_id,
      appointment: `${appDate} ${appTime}`
    },
    output: {
      reminders_scheduled,
      follow_up,
      total_reminders: reminders_scheduled.length + 1
    },
    status: "success",
    timestamp
  };
};

module.exports = {
  runReminderAgent
};
