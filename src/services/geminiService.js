const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

/**
 * Service to interact with Google Gemini API with fallback to Lite models
 */
const extractEntities = async (message) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // Trying 1.5 Flash as a fallback even if not listed, as it has the most reliable free quota
  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-2.0-flash-lite", "gemini-2.0-flash"];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      const systemPrompt = `
You are a Pakistani informal economy service booking NER (Named Entity Recognition) engine.
Your task is to extract structured information from messages written in Roman Urdu, Urdu, or English.

RULES:
1. Support Roman Urdu (e.g., "mujhe plumber chahiye"), Urdu (e.g., "مجھے پلمبر چاہیے"), and English.
2. Extract the following fields:
   - intent: One of ["book_service", "cancel_service", "query_status", "general_inquiry"]
   - service_type: Normalize to English based on common Pakistani terms (see mapping below).
   - location: Area, sector, or specific place mentioned.
   - time_raw: The exact time phrase used by the user.
   - time_normalized: Convert the time phrase to standard English (see mapping below).
   - language_detected: One of ["roman_urdu", "urdu", "english", "mixed"]

SERVICE TYPE MAPPING (Normalize to English):
- "bijli wala", "bijli", "electrician" -> "Electrician"
- "AC wala", "AC technician", "AC repair" -> "AC Technician"
- "plumber", "nalka wala", "panney wala" -> "Plumber"
- "painter", "rang wala", "rangai" -> "Painter"
- "carpenter", "badhai", "lakri wala" -> "Carpenter"
- "tutor", "ustad", "teacher", "tuition" -> "Tutor"
- "maid", "kaam wali", "masi" -> "House Maid"
- "driver", "gaari wala" -> "Driver"
- "gardener", "mali" -> "Gardener"
- "cook", "bawarchi" -> "Cook"

TIME NORMALIZATION MAPPING:
- "kal subah" -> "tomorrow morning"
- "aaj shaam" -> "today evening"
- "abhi", "right now" -> "right now"
- "parso" -> "day after tomorrow"
- "aglay hafte" -> "next week"
- If no time is mentioned, return null.

OUTPUT FORMAT:
- Return ONLY a valid JSON object.
- No markdown formatting, no backticks, no explanation.
- If a field cannot be determined, return null.

User Message: "${message}"
`;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanJson = text.replace(/```json|```/gi, "").trim();
      return JSON.parse(cleanJson);

    } catch (err) {
      lastError = err;
      // If it's a 404 (Not Found) or 429 (Quota), try the next model
      if (err.message.includes("404") || err.message.includes("429")) {
        console.log(`Model ${modelName} failed (${err.status}), trying next...`);
        continue;
      }
      throw err;
    }
  }

  throw new Error(`Gemini AI Error: ${lastError.message}`);
};

module.exports = {
  extractEntities,
};
