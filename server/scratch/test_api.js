const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function test() {
  console.log("Using API Key:", process.env.GEMINI_API_KEY ? "FOUND" : "MISSING");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const models = [
    { name: "gemini-1.5-flash", version: "v1" },
    { name: "gemini-1.5-flash", version: "v1beta" },
    { name: "embedding-001", version: "v1" },
    { name: "text-embedding-004", version: "v1beta" }
  ];

  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m.name }, { apiVersion: m.version });
      console.log(`Testing ${m.name} (${m.version})...`);
      // Just a tiny test
      if (m.name.includes("embedding")) {
         await model.embedContent("test");
      } else {
         await model.generateContent("hi");
      }
      console.log(`✅ ${m.name} (${m.version}) WORKS!`);
    } catch (e) {
      console.error(`❌ ${m.name} (${m.version}) FAILED: ${e.message}`);
    }
  }
}
test();
