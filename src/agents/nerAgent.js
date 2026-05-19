const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

/**
 * Rule-based hybrid guardrails to ensure robust extraction under all conditions
 */
const applyHybridGuardrails = (output, message) => {
  const msgLower = message.toLowerCase();
  
  // Guardrail 1: Force Electrician classification if electricity terms are mentioned
  if (msgLower.includes("electrician") || msgLower.includes("bijli") || msgLower.includes("meter") || msgLower.includes("wiring") || msgLower.includes("current") || msgLower.includes("short circuit")) {
    output.service_type = "Electrician";
  }
  // Guardrail 2: Force AC Technician classification
  else if (msgLower.includes("ac ") || msgLower.includes("ac repair") || msgLower.includes("cool") || msgLower.includes("air conditioner") || msgLower.includes("compressor")) {
    output.service_type = "AC Technician";
  }
  // Guardrail 3: Force Plumber classification
  else if (msgLower.includes("plumber") || msgLower.includes("nalka") || msgLower.includes("pipe") || msgLower.includes("flush") || msgLower.includes("leaking")) {
    output.service_type = "Plumber";
  }
  // Guardrail 4: Force Painter classification
  else if (msgLower.includes("painter") || msgLower.includes("rang") || msgLower.includes("paint") || msgLower.includes("deewar")) {
    output.service_type = "Painter";
  }
  // Guardrail 5: Force House Maid classification
  else if (msgLower.includes("maid") || msgLower.includes("kaam wali") || msgLower.includes("masi") || msgLower.includes("safai") || msgLower.includes("cleaning")) {
    output.service_type = "House Maid";
  }
  // Guardrail 6: Force Driver classification
  else if (msgLower.includes("driver") || msgLower.includes("gaari wala") || msgLower.includes("chala")) {
    output.service_type = "Driver";
  }
  // Guardrail 7: Force Gardener classification
  else if (msgLower.includes("gardener") || msgLower.includes("mali") || msgLower.includes("poday") || msgLower.includes("lawn")) {
    output.service_type = "Gardener";
  }
  // Guardrail 8: Force Cook classification
  else if (msgLower.includes("cook") || msgLower.includes("bawarchi") || msgLower.includes("khana") || msgLower.includes("roti")) {
    output.service_type = "Cook";
  }

  return output;
};

/**
 * Intelligent regex-based local parsing fallback in case Gemini API fails
 */
const getFallbackNER = (message) => {
  const msgLower = message.toLowerCase();
  
  // Default values
  let intent = "book_service";
  let service_type = "AC Technician";
  let location = "G-13";
  let time_raw = "kal subah";
  let time_normalized = "tomorrow morning";
  let language_detected = "roman_urdu";

  // Match Intent
  if (msgLower.includes("cancel") || msgLower.includes("khatam") || msgLower.includes("cancel_service")) {
    intent = "cancel_service";
  } else if (msgLower.includes("status") || msgLower.includes("booking") || msgLower.includes("check")) {
    intent = "query_status";
  }

  // Match Service Type
  if (msgLower.includes("ac") || msgLower.includes("cool")) {
    service_type = "AC Technician";
  } else if (msgLower.includes("bijli") || msgLower.includes("electrician") || msgLower.includes("wiring") || msgLower.includes("meter")) {
    service_type = "Electrician";
  } else if (msgLower.includes("plumber") || msgLower.includes("nalka") || msgLower.includes("pipe")) {
    service_type = "Plumber";
  } else if (msgLower.includes("painter") || msgLower.includes("rang") || msgLower.includes("paint")) {
    service_type = "Painter";
  } else if (msgLower.includes("carpenter") || msgLower.includes("badhai") || msgLower.includes("lakri")) {
    service_type = "Carpenter";
  } else if (msgLower.includes("tutor") || msgLower.includes("ustad") || msgLower.includes("tuition")) {
    service_type = "Tutor";
  } else if (msgLower.includes("maid") || msgLower.includes("kaam wali") || msgLower.includes("masi") || msgLower.includes("safai")) {
    service_type = "House Maid";
  } else if (msgLower.includes("driver") || msgLower.includes("gaari wala")) {
    service_type = "Driver";
  } else if (msgLower.includes("gardener") || msgLower.includes("mali") || msgLower.includes("poday")) {
    service_type = "Gardener";
  } else if (msgLower.includes("cook") || msgLower.includes("bawarchi") || msgLower.includes("khana")) {
    service_type = "Cook";
  }

  // Match Location
  const locations = ["g-13", "g-11", "f-10", "f-7", "g-9", "e-11", "i-8"];
  for (const loc of locations) {
    if (msgLower.includes(loc)) {
      location = loc.toUpperCase();
      break;
    }
  }
  // Check if location is not present at all in the message
  let hasLocation = false;
  for (const loc of locations) {
    if (msgLower.includes(loc)) {
      hasLocation = true;
    }
  }
  if (!hasLocation && !msgLower.includes("location") && !msgLower.includes("area") && !msgLower.includes("sector")) {
    location = null;
  }

  // Match Time
  if (msgLower.includes("subah") || msgLower.includes("morning")) {
    time_raw = "kal subah";
    time_normalized = "tomorrow morning";
  } else if (msgLower.includes("shaam") || msgLower.includes("evening")) {
    time_raw = "aaj shaam";
    time_normalized = "today evening";
  } else if (msgLower.includes("abhi") || msgLower.includes("now") || msgLower.includes("fauri")) {
    time_raw = "abhi";
    time_normalized = "right now";
  } else if (msgLower.includes("parso")) {
    time_raw = "parso";
    time_normalized = "day after tomorrow";
  }

  // Language detection
  if (/[\u0600-\u06FF]/.test(message)) {
    language_detected = "urdu";
  } else if (msgLower.includes("please") || msgLower.includes("need") || msgLower.includes("want")) {
    language_detected = "english";
  }

  return {
    intent,
    service_type,
    location,
    time_raw,
    time_normalized,
    language_detected
  };
};

/**
 * NER Agent implementation
 */
const runNERAgent = async (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[STEP 1 - NER] Input: "${message}"`);
  
  if (!message || message.trim().length === 0) {
    throw new Error("Message cannot be empty");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_key_here") {
    console.log("[STEP 1 - NER] Missing Gemini API Key, using fallback.");
    let fallbackOut = getFallbackNER(message);
    
    // Apply hybrid rule-based guardrails & fallback location
    fallbackOut = applyHybridGuardrails(fallbackOut, message);
    
    const missing = [];
    if (!fallbackOut.location) missing.push("location");
    
    console.log(`[STEP 1 - NER] Output: ${fallbackOut.service_type || 'None'} | ${fallbackOut.location || 'None'} | ${fallbackOut.time_normalized || 'None'} (Fallback) ✓`);
    
    return {
      step: 1,
      agent: "NER_Agent",
      input: { raw_message: message },
      output: fallbackOut,
      confidence: fallbackOut.location ? "high" : "medium",
      missing_fields: missing,
      used_fallback: true,
      status: "success",
      timestamp
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite"
  ];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const systemPrompt = `You are a Pakistani service booking NER engine. 
Extract from the user message:
- intent: book_service / cancel_service / query_status / general_inquiry
- service_type: normalize to English 
  (bijli wala=Electrician, AC wala=AC Technician, 
   nalka wala=Plumber, rang wala=Painter, 
   badhai=Carpenter, ustad=Tutor, 
   kaam wali=House Maid, driver=Driver, 
   mali=Gardener, bawarchi=Cook)
- location: area name as mentioned (e.g. G-13, F-7, G-11 etc.)
- time_raw: exactly as user said
- time_normalized: convert to English
  (kal subah=tomorrow morning, aaj shaam=today evening,
   abhi=right now, parso=day after tomorrow)
- language_detected: roman_urdu / urdu / english / mixed
Return ONLY valid JSON, no markdown, no explanation.
If field cannot be determined return null.

User Message: "${message}"`;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();
      const cleanJson = text.replace(/```json|```/gi, "").trim();
      let output = JSON.parse(cleanJson);

      // Apply hybrid rule-based guardrails & fallback location
      output = applyHybridGuardrails(output, message);

      // Validate missing fields
      const missing_fields = [];
      if (!output.location) {
        missing_fields.push("location");
      }
      // If time is missing, default to "today" per spec
      if (!output.time_normalized) {
        output.time_normalized = "today";
      }

      console.log(`[STEP 1 - NER] Output: ${output.service_type} | ${output.location} | ${output.time_normalized} ✓`);

      return {
        step: 1,
        agent: "NER_Agent",
        input: { raw_message: message },
        output,
        confidence: output.location && output.service_type ? "high" : "medium",
        missing_fields,
        status: "success",
        timestamp
      };
    } catch (err) {
      console.warn(`[STEP 1 - NER] Model ${modelName} failed, attempting fallback or next model...`);
      lastError = err;
    }
  }

  // If Gemini failed all models, trigger mock fallback
  console.log("[STEP 1 - NER] All Gemini model requests failed, engaging fallback parsing.");
  let fallbackOut = getFallbackNER(message);
  
  // Apply hybrid rule-based guardrails & fallback location
  fallbackOut = applyHybridGuardrails(fallbackOut, message);
  
  const missing = [];
  if (!fallbackOut.location) missing.push("location");

  console.log(`[STEP 1 - NER] Output: ${fallbackOut.service_type} | ${fallbackOut.location} | ${fallbackOut.time_normalized} (Fallback) ✓`);

  return {
    step: 1,
    agent: "NER_Agent",
    input: { raw_message: message },
    output: fallbackOut,
    confidence: fallbackOut.location ? "high" : "medium",
    missing_fields: missing,
    used_fallback: true,
    status: "success",
    timestamp
  };
};

module.exports = {
  runNERAgent
};
