const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function list() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_key_here") {
      console.error("❌ GEMINI_API_KEY is not set in .env file");
      return;
    }

    console.log("🔍 Checking available models for your API key...");
    
    // We use a direct fetch to the v1/models endpoint
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    
    if (!response.ok) {
      const errData = await response.json();
      console.error("❌ API Error:", errData.error?.message || response.statusText);
      return;
    }

    const data = await response.json();
    
    if (!data.models || data.models.length === 0) {
      console.log("⚠️ No models found for this API key.");
      return;
    }

    console.log("\n✅ Your available models are:");
    data.models.forEach(m => {
      // Show only models that support content generation
      if (m.supportedGenerationMethods.includes("generateContent")) {
        console.log(` - ${m.name.replace('models/', '')}`);
      }
    });
    
    console.log("\nCopy one of these names and let me know, or use them to update geminiService.js");

  } catch (e) {
    console.error("❌ Network Error:", e.message);
  }
}

list();
