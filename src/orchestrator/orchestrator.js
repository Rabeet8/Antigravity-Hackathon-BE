const { runNERAgent } = require("../agents/nerAgent");
const { runSearchAgent } = require("../agents/searchAgent");
const { runRankingAgent } = require("../agents/rankingAgent");
const { runBookingAgent } = require("../agents/bookingAgent");
const { runReminderAgent } = require("../agents/reminderAgent");

/**
 * Orchestrator implementation
 */
const runOrchestrator = async (message) => {
  const startTime = Date.now();
  const session_id = `SESS-${new Date().toISOString().split("T")[0].replace(/-/g, "")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  console.log(`\n[ORCHESTRATOR] Session: ${session_id} started`);

  const agent_trace = [];
  const full_trace = {};
  let final_output = {};

  try {
    // -------------------------------------------------------------
    // STEP 1: NER AGENT
    // -------------------------------------------------------------
    const nerResult = await runNERAgent(message);
    agent_trace.push({
      step: 1,
      agent: "NER_Agent",
      status: nerResult.status,
      summary: `Extracted: ${nerResult.output.service_type || 'None'} | ${nerResult.output.location || 'None'} | ${nerResult.output.time_normalized || 'None'}`,
      timestamp: nerResult.timestamp
    });
    full_trace.ner = nerResult;

    // Check for missing location error case per Part 6
    if (!nerResult.output.location) {
      console.log(`[ORCHESTRATOR] Missing location in user message.`);
      return {
        orchestrator: "Kaam_Karo_Antigravity",
        session_id,
        total_steps: 5,
        completed_steps: 1,
        execution_time_ms: Date.now() - startTime,
        agent_trace,
        full_trace,
        final_output: {
          error_code: "MISSING_LOCATION",
          missing_fields: ["location"],
          confirmation_message: "Aap ka area kaunsa hai? (Jaise G-13, F-7)",
          reminders: [],
          top_providers: []
        }
      };
    }

    // -------------------------------------------------------------
    // STEP 2: SEARCH AGENT
    // -------------------------------------------------------------
    const searchResult = await runSearchAgent(nerResult.output);
    agent_trace.push({
      step: 2,
      agent: "Search_Agent",
      status: searchResult.status,
      summary: `Found ${searchResult.output.total_found} providers matching ${nerResult.output.service_type || 'service'} in ${nerResult.output.location} area`,
      timestamp: searchResult.timestamp
    });
    full_trace.search = searchResult;

    // Check if zero providers found per Part 6
    if (searchResult.output.total_found === 0) {
      console.log(`[ORCHESTRATOR] No providers found in search step.`);
      return {
        orchestrator: "Kaam_Karo_Antigravity",
        session_id,
        total_steps: 5,
        completed_steps: 2,
        execution_time_ms: Date.now() - startTime,
        agent_trace,
        full_trace,
        final_output: {
          error_code: "NO_PROVIDERS",
          confirmation_message: `Is area mein koi ${nerResult.output.service_type || 'provider'} nahi mila.`,
          reminders: [],
          top_providers: []
        }
      };
    }

    // -------------------------------------------------------------
    // STEP 3: RANKING AGENT
    // -------------------------------------------------------------
    const rankingResult = await runRankingAgent(searchResult.output);
    agent_trace.push({
      step: 3,
      agent: "Ranking_Agent",
      status: rankingResult.status,
      summary: `${rankingResult.output.ranked_providers[0]?.name || 'Top provider'} ranked #1 — Score: ${rankingResult.output.ranked_providers[0]?.score || 0}`,
      timestamp: rankingResult.timestamp
    });
    full_trace.ranking = rankingResult;

    const recommendedId = rankingResult.output.recommended_provider_id;

    // -------------------------------------------------------------
    // STEP 4: BOOKING AGENT
    // -------------------------------------------------------------
    const bookingResult = await runBookingAgent({
      provider_id: recommendedId,
      service_type: nerResult.output.service_type,
      location: nerResult.output.location,
      time_normalized: nerResult.output.time_normalized
    });
    agent_trace.push({
      step: 4,
      agent: "Booking_Agent",
      status: bookingResult.status,
      summary: `Booking confirmed — ID: ${bookingResult.output.booking_ref || bookingResult.output.booking_id}, Slot: ${bookingResult.output.appointment.time} tomorrow`,
      timestamp: bookingResult.timestamp
    });
    full_trace.booking = bookingResult;

    // -------------------------------------------------------------
    // STEP 5: REMINDER AGENT
    // -------------------------------------------------------------
    const reminderResult = await runReminderAgent({
      booking_id: bookingResult.output.booking_id,
      appointment_date: bookingResult.output.appointment.date,
      appointment_time: bookingResult.output.appointment.time,
      provider_name: bookingResult.output.provider.name
    });
    agent_trace.push({
      step: 5,
      agent: "Reminder_Agent",
      status: reminderResult.status,
      summary: `3 reminders scheduled — night before, 1hr before, completion check`,
      timestamp: reminderResult.timestamp
    });
    full_trace.reminder = reminderResult;

    // -------------------------------------------------------------
    // COMPILE FINAL OUTPUT
    // -------------------------------------------------------------
    const execution_time_ms = Date.now() - startTime;
    console.log(`[ORCHESTRATOR] Complete. Execution time: ${execution_time_ms}ms\n`);

    // Map reminders array to strings
    const reminderList = [
      `Tonight 8:00 PM — night before reminder: "${reminderResult.output.reminders_scheduled[0]?.message || ''}"`,
      `Tomorrow 9:00 AM — 1 hour before reminder: "${reminderResult.output.reminders_scheduled[1]?.message || ''}"`,
      `Tomorrow 12:00 PM — completion check: "${reminderResult.output.follow_up?.message || ''}"`
    ];

    // Format top providers summary list
    const top_providers = rankingResult.output.ranked_providers.map(rp => {
      // Find matching item in search output to read distance
      const match = searchResult.output.providers.find(p => p.id === rp.provider_id) || {};
      return {
        rank: rp.rank,
        name: rp.name,
        score: rp.score,
        distance: `${match.distance_km || 0} km`,
        rating: match.rating || 0
      };
    });

    final_output = {
      booking_id: bookingResult.output.booking_id,
      service: nerResult.output.service_type,
      provider_name: bookingResult.output.provider.name,
      provider_contact: bookingResult.output.provider.contact,
      slot: bookingResult.output.receipt.slot,
      location: bookingResult.output.appointment.location,
      estimated_cost: bookingResult.output.receipt.estimated_cost,
      confirmation_message: bookingResult.output.confirmation_message,
      reminders: reminderList,
      top_providers
    };

    return {
      orchestrator: "Kaam_Karo_Antigravity",
      session_id,
      total_steps: 5,
      completed_steps: 5,
      execution_time_ms,
      agent_trace,
      full_trace,
      final_output
    };

  } catch (error) {
    console.error(`[ORCHESTRATOR] Failed during execution:`, error);
    const execution_time_ms = Date.now() - startTime;
    return {
      orchestrator: "Kaam_Karo_Antigravity",
      session_id,
      total_steps: 5,
      completed_steps: agent_trace.length,
      execution_time_ms,
      agent_trace,
      full_trace,
      error: error.message || "Failed to fully orchestrate request."
    };
  }
};

module.exports = {
  runOrchestrator
};
