/**
 * Service to parse Gemini output, calculate confidence, and identify missing fields
 */
const parseNERResult = (extracted, originalMessage) => {
  const missingFields = [];
  
  // Required fields for "high" confidence
  const criticalFields = ["service_type", "location", "time_normalized"];
  
  criticalFields.forEach(field => {
    if (!extracted[field]) {
      // For time, we specifically check time_normalized as per requirements
      if (field === "time_normalized" && !extracted.time_normalized) {
        missingFields.push("time");
      } else {
        missingFields.push(field);
      }
    }
  });

  // Confidence logic:
  // - "high" -> all 3 fields present (service_type, location, time_normalized)
  // - "medium" -> service_type present but location or time missing
  // - "low" -> service_type is also null
  let confidence = "low";
  if (extracted.service_type) {
    if (extracted.location && extracted.time_normalized) {
      confidence = "high";
    } else {
      confidence = "medium";
    }
  }

  return {
    success: true,
    original_message: originalMessage,
    extracted: {
      intent: extracted.intent || "general_inquiry",
      service_type: extracted.service_type || null,
      location: extracted.location || null,
      time_raw: extracted.time_raw || null,
      time_normalized: extracted.time_normalized || null,
      language_detected: extracted.language_detected || "unknown"
    },
    confidence,
    missing_fields: missingFields
  };
};

module.exports = {
  parseNERResult,
};
