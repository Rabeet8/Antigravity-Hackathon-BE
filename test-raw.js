require("dotenv").config();

async function testRaw() {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
  
  console.log(`Testing with model: ${model} using v1 endpoint`);
  
  const body = {
    contents: [{ parts: [{ text: "Say hello" }] }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (response.ok) {
      console.log("✅ Success! Response:", data.candidates[0].content.parts[0].text);
    } else {
      console.error("❌ Failed:", data.error?.message || response.statusText);
      console.error("Details:", JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("❌ Network Error:", err.message);
  }
}

testRaw();
