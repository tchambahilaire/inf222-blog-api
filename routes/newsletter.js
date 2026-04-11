const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.post('/subscribe', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email requis' });
  }
  
  db.run(`INSERT INTO newsletter (email) VALUES (?)`, [email], (err) => {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Cet email est déjà inscrit' });
      }
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    res.json({ message: '✅ Inscription réussie à la newsletter !' });
  });
});

router.get('/count', (req, res) => {
  db.get(`SELECT COUNT(*) as total FROM newsletter`, [], (err, row) => {
    res.json({ total: row?.total || 0 });
  });
});

module.exports = router;
