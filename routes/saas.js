const express = require('express');
const router = express.Router();
const db = require('../database/db');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

// Table des clients
db.run(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    sous_domaine TEXT UNIQUE NOT NULL,
    email_admin TEXT NOT NULL,
    motdepasse TEXT NOT NULL,
    plan TEXT DEFAULT 'basic',
    date_creation TEXT DEFAULT CURRENT_DATE,
    actif INTEGER DEFAULT 1
  )
`);

// Créer dossier clients
if (!fs.existsSync('./database/clients')) {
  fs.mkdirSync('./database/clients', { recursive: true });
}

// Fonction pour créer la base d'un client
function createClientDatabase(sous_domaine) {
  const clientDbPath = path.join(__dirname, '../database/clients', `${sous_domaine}.db`);
  const sqlite3 = require('sqlite3').verbose();
  const clientDb = new sqlite3.Database(clientDbPath);
  
  clientDb.run(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titre TEXT NOT NULL,
      contenu TEXT NOT NULL,
      auteur TEXT NOT NULL,
      date TEXT DEFAULT CURRENT_DATE,
      categorie TEXT,
      tags TEXT,
      image TEXT,
      total_vues INTEGER DEFAULT 0
    )
  `);
  
  clientDb.run(`
    CREATE TABLE IF NOT EXISTS newsletter (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      date_inscription TEXT DEFAULT CURRENT_DATE
    )
  `);
  
  clientDb.run(`
    CREATE TABLE IF NOT EXISTS commentaires (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL,
      pseudo TEXT NOT NULL,
      contenu TEXT NOT NULL,
      date TEXT DEFAULT CURRENT_DATE,
      valide INTEGER DEFAULT 0
    )
  `);
  
  clientDb.close();
  return clientDbPath;
}

// Créer un client
router.post('/client/create', async (req, res) => {
  const { nom, sous_domaine, email_admin, motdepasse, plan } = req.body;
  
  if (!nom || !sous_domaine || !email_admin || !motdepasse) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  
  const hashedPassword = await bcrypt.hash(motdepasse, 10);
  
  db.run(
    `INSERT INTO clients (nom, sous_domaine, email_admin, motdepasse, plan) VALUES (?, ?, ?, ?, ?)`,
    [nom, sous_domaine, email_admin, hashedPassword, plan || 'basic'],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Ce sous-domaine est déjà pris' });
        }
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      createClientDatabase(sous_domaine);
      
      res.json({
        success: true,
        message: 'Client créé avec succès',
        clientId: this.lastID,
        sous_domaine: sous_domaine,
        url: `http://${sous_domaine}.localhost:3000`
      });
    }
  );
});

// Liste des clients
router.get('/clients', (req, res) => {
  db.all(`SELECT id, nom, sous_domaine, email_admin, plan, date_creation, actif FROM clients ORDER BY date_creation DESC`, [], (err, clients) => {
    if (err) return res.status(500).json({ error: 'Erreur' });
    res.json(clients);
  });
});

// Détail d'un client
router.get('/client/:id', (req, res) => {
  db.get(`SELECT id, nom, sous_domaine, email_admin, plan, date_creation, actif FROM clients WHERE id = ?`, [req.params.id], (err, client) => {
    if (err || !client) return res.status(404).json({ error: 'Client non trouvé' });
    res.json(client);
  });
});

// Modifier plan
router.put('/client/:id/plan', (req, res) => {
  const { plan } = req.body;
  const validPlans = ['basic', 'pro', 'enterprise'];
  
  if (!validPlans.includes(plan)) {
    return res.status(400).json({ error: 'Plan invalide (basic, pro, enterprise)' });
  }
  
  db.run(`UPDATE clients SET plan = ? WHERE id = ?`, [plan, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Erreur' });
    res.json({ message: `Plan mis à jour : ${plan}` });
  });
});

// Activer/Désactiver client
router.put('/client/:id/toggle', (req, res) => {
  db.get(`SELECT actif FROM clients WHERE id = ?`, [req.params.id], (err, client) => {
    if (err || !client) return res.status(404).json({ error: 'Client non trouvé' });
    const newStatus = client.actif === 1 ? 0 : 1;
    db.run(`UPDATE clients SET actif = ? WHERE id = ?`, [newStatus, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: 'Erreur' });
      res.json({ message: `Client ${newStatus === 1 ? 'activé' : 'désactivé'}` });
    });
  });
});

// Supprimer client
router.delete('/client/:id', (req, res) => {
  db.get(`SELECT sous_domaine FROM clients WHERE id = ?`, [req.params.id], (err, client) => {
    if (err || !client) return res.status(404).json({ error: 'Client non trouvé' });
    
    const clientDbPath = path.join(__dirname, '../database/clients', `${client.sous_domaine}.db`);
    if (fs.existsSync(clientDbPath)) {
      fs.unlinkSync(clientDbPath);
    }
    
    db.run(`DELETE FROM clients WHERE id = ?`, [req.params.id], (err) => {
      if (err) return res.status(500).json({ error: 'Erreur suppression' });
      res.json({ message: 'Client supprimé' });
    });
  });
});

// Statistiques SaaS
router.get('/stats', (req, res) => {
  db.get(`
    SELECT 
      COUNT(*) as total_clients,
      SUM(CASE WHEN plan = 'basic' THEN 1 ELSE 0 END) as basic_count,
      SUM(CASE WHEN plan = 'pro' THEN 1 ELSE 0 END) as pro_count,
      SUM(CASE WHEN plan = 'enterprise' THEN 1 ELSE 0 END) as enterprise_count,
      SUM(CASE WHEN actif = 1 THEN 1 ELSE 0 END) as actif_count
    FROM clients
  `, [], (err, stats) => {
    if (err) return res.status(500).json({ error: 'Erreur' });
    res.json(stats);
  });
});

module.exports = router;
