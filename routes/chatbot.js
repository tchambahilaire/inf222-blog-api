const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
// Utiliser le modèle 2.0 flash (le plus récent)
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

router.post('/chat', async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message requis' });
  }
  
  try {
    const result = await model.generateContent(message);
    const response = result.response.text();
    res.json({ response });
  } catch (error) {
    console.error('Erreur:', error.message);
    res.json({ response: "Désolé, une erreur est survenue. Réessayez." });
  }
});

module.exports = router;
