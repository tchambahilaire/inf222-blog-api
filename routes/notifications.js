const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Table des abonnements push
db.run(`
  CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint TEXT UNIQUE,
    user_agent TEXT,
    date_inscription TEXT DEFAULT CURRENT_DATE
  )
`);

// S'abonner
router.post('/subscribe', (req, res) => {
  const { endpoint, user_agent } = req.body;
  
  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint requis' });
  }
  
  db.run(`INSERT INTO push_subscriptions (endpoint, user_agent) VALUES (?, ?)`, [endpoint, user_agent || 'unknown'], (err) => {
    if (err && err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Déjà abonné' });
    }
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json({ message: '✅ Abonné aux notifications !' });
  });
});

// Se désabonner
router.post('/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  
  db.run(`DELETE FROM push_subscriptions WHERE endpoint = ?`, [endpoint], (err) => {
    if (err) return res.status(500).json({ error: 'Erreur' });
    res.json({ message: 'Désabonné' });
  });
});

// Envoyer notification (admin)
router.post('/send', (req, res) => {
  const { title, body } = req.body;
  
  if (!title || !body) {
    return res.status(400).json({ error: 'Titre et contenu requis' });
  }
  
  db.all(`SELECT endpoint FROM push_subscriptions`, [], (err, subscriptions) => {
    if (err) return res.status(500).json({ error: 'Erreur' });
    
    // Simulation d'envoi (dans la réalité, utiliser web-push)
    const notification = { 
      title, 
      body, 
      timestamp: new Date().toISOString(),
      destinataires: subscriptions.length 
    };
    
    res.json({
      success: true,
      message: `Notification envoyée à ${subscriptions.length} abonnés`,
      notification: notification
    });
  });
});

// Nombre d'abonnés
router.get('/count', (req, res) => {
  db.get(`SELECT COUNT(*) as total FROM push_subscriptions`, [], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erreur' });
    res.json({ total: row?.total || 0 });
  });
});

// Liste des abonnés (admin)
router.get('/subscribers', (req, res) => {
  db.all(`SELECT id, endpoint, user_agent, date_inscription FROM push_subscriptions ORDER BY date_inscription DESC`, [], (err, subs) => {
    if (err) return res.status(500).json({ error: 'Erreur' });
    res.json(subs);
  });
});

module.exports = router;
