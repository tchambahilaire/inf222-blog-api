const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Créer la table webhooks
db.run(`
  CREATE TABLE IF NOT EXISTS webhooks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    evenement TEXT NOT NULL,
    actif INTEGER DEFAULT 1,
    date_creation TEXT DEFAULT CURRENT_DATE
  )
`);

// Ajouter un webhook
router.post('/register', (req, res) => {
  const { url, evenement } = req.body;
  
  if (!url || !evenement) {
    return res.status(400).json({ error: 'URL et événement requis' });
  }
  
  db.run(`INSERT INTO webhooks (url, evenement) VALUES (?, ?)`, [url, evenement], (err) => {
    if (err) return res.status(500).json({ error: 'Erreur' });
    res.json({ message: 'Webhook enregistré', url, evenement });
  });
});

// Lister les webhooks
router.get('/', (req, res) => {
  db.all(`SELECT * FROM webhooks`, [], (err, webhooks) => {
    res.json(webhooks);
  });
});

// Supprimer un webhook
router.delete('/:id', (req, res) => {
  db.run(`DELETE FROM webhooks WHERE id = ?`, [req.params.id], (err) => {
    res.json({ message: 'Webhook supprimé' });
  });
});

// Notifier les webhooks
const notifierWebhooks = async (evenement, data) => {
  const fetch = (await import('node-fetch')).default;
  db.all(`SELECT url FROM webhooks WHERE evenement = ? OR evenement = 'tous'`, [evenement], (err, webhooks) => {
    if (err || !webhooks) return;
    webhooks.forEach(w => {
      fetch(w.url, { 
        method: 'POST', 
        body: JSON.stringify({ evenement, data, timestamp: new Date().toISOString() }), 
        headers: { 'Content-Type': 'application/json' } 
      }).catch(e => console.log('Webhook échoué:', e.message));
    });
  });
};

module.exports = { router, notifierWebhooks };
