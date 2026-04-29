const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function list() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Key:", apiKey);
  
  // Using fetch to bypass SDK complexity for listing
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log("Models Response:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Fetch failed", e.message);
  }
}
list();
