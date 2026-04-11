const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.post('/', (req, res) => {
  const { article_id, pseudo, contenu } = req.body;
  if (!article_id || !pseudo || !contenu) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  db.run(`INSERT INTO commentaires (article_id, pseudo, contenu, valide) VALUES (?, ?, ?, 0)`,
    [article_id, pseudo, contenu], function(err) {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      res.status(201).json({ message: 'Commentaire ajouté (en attente de validation)' });
    });
});

router.get('/article/:id', (req, res) => {
  db.all(`SELECT * FROM commentaires WHERE article_id = ? AND valide = 1 ORDER BY date DESC`,
    [req.params.id], (err, comments) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      res.json(comments);
    });
});

router.get('/pending', (req, res) => {
  db.all(`SELECT * FROM commentaires WHERE valide = 0 ORDER BY date DESC`, [], (err, comments) => {
    res.json(comments);
  });
});

router.put('/approve/:id', (req, res) => {
  db.run(`UPDATE commentaires SET valide = 1 WHERE id = ?`, [req.params.id], (err) => {
    res.json({ message: 'Commentaire approuvé' });
  });
});

module.exports = router;
