const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../database/db');

// Simuler l'authentification Google
router.post('/google', (req, res) => {
  const { email, nom, googleId } = req.body;
  
  if (!email || !nom) {
    return res.status(400).json({ error: 'Email et nom requis' });
  }
  
  // Vérifier si l'utilisateur existe
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    
    if (!user) {
      // Créer un nouvel utilisateur
      db.run(`INSERT INTO users (nom, email, motdepasse, role) VALUES (?, ?, ?, 'user')`, 
        [nom, email, 'google_auth_' + Date.now()], function(err) {
          if (err) return res.status(500).json({ error: 'Erreur création' });
          
          const token = jwt.sign({ id: this.lastID, email, role: 'user' }, 'secret', { expiresIn: '7d' });
          res.json({ token, user: { id: this.lastID, nom, email, role: 'user' } });
        });
    } else {
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, 'secret', { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, nom: user.nom, email: user.email, role: user.role } });
    }
  });
});

module.exports = router;
