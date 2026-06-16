const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Polyfill fetch for Node.js 14
if (!globalThis.fetch) {
  globalThis.fetch = require('node-fetch');
  globalThis.Headers = require('node-fetch').Headers;
  globalThis.Request = require('node-fetch').Request;
  globalThis.Response = require('node-fetch').Response;
}

console.log("Using API Key:", process.env.GEMINI_API_KEY.substring(0, 10) + "...");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent("Hello!");
    console.log("Success:", result.response.text());
  } catch (e) {
    console.error("Error:", e.message);
  }
}

test();
