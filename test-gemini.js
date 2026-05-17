const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const modelName = "gemma-4-26b-a4b-it"; // Testing Gemma model
  console.log(`Testing with model: ${modelName}`);
  
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say hello");
    const response = await result.response;
    console.log("✅ Success! Response:", response.text());
  } catch (err) {
    console.error("❌ Failed:", err.message);
    if (err.response) {
      console.error("Status:", err.status);
      console.error("Details:", JSON.stringify(err.response, null, 2));
    }
  }
}

test();
