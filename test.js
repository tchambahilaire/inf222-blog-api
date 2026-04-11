require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = process.env.GEMINI_API_KEY;
console.log("Clé API chargée:", API_KEY ? "OUI ✅" : "NON ❌");

if (!API_KEY) {
  console.log("❌ Clé API non trouvée dans .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function test() {
  try {
    const result = await model.generateContent("Qui est le président du Cameroun ?");
    console.log("✅ Réponse:", result.response.text());
  } catch (error) {
    console.log("❌ Erreur:", error.message);
  }
}

test();
