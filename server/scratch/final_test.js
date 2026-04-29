const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const models = [
    { name: "gemini-2.5-flash", version: "v1beta" },
    { name: "gemini-embedding-001", version: "v1beta" }
  ];

  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m.name }, { apiVersion: m.version });
      if (m.name.includes("embedding")) {
         await model.embedContent("test");
      } else {
         await model.generateContent("hi");
      }
      console.log(`✅ ${m.name} WORKS!`);
    } catch (e) {
      console.error(`❌ ${m.name} FAILED: ${e.message}`);
    }
  }
}
test();
