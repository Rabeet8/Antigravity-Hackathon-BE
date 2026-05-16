const geminiService = require("../services/geminiService");
const nerParser = require("../services/nerParser");

/**
 * Controller for NER related operations
 */
const extractEntities = async (req, res) => {
  const originalMessage = req.sanitizedMessage;

  try {
    // 1. Call Gemini to get raw extraction
    const rawResult = await geminiService.extractEntities(originalMessage);

    // 2. Parse and apply confidence scoring logic
    const processedResult = nerParser.parseNERResult(rawResult, originalMessage);

    // 3. Log the request (simple console log as requested)
    console.log(`[${new Date().toISOString()}] NER Extraction:`, {
      original: originalMessage,
      result: processedResult
    });

    return res.status(200).json(processedResult);
  } catch (error) {
    console.error("NER Controller Error:", error);
    
    // Check if it's a parsing error or API error
    const errorMessage = error.message.includes("Unexpected token") 
      ? "Gemini returned invalid JSON output" 
      : error.message;

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to process message with Gemini AI"
    });
  }
};

/**
 * Health check endpoint
 */
const healthCheck = (req, res) => {
  return res.status(200).json({ status: "ok" });
};

module.exports = {
  extractEntities,
  healthCheck,
};
