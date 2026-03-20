const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Chemin vers la base de données
const dbPath = path.resolve(__dirname, 'blog.db');

// Connexion à SQLite
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur de connexion:', err.message);
  } else {
    console.log('✅ Connecté à SQLite');
  }
});

// Création de la table articles
db.run(`
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre TEXT NOT NULL,
    contenu TEXT NOT NULL,
    auteur TEXT NOT NULL,
    date TEXT DEFAULT CURRENT_DATE,
    categorie TEXT,
    tags TEXT
  )
`, (err) => {
  if (err) {
    console.error('❌ Erreur création table:', err.message);
  } else {
    console.log('✅ Table articles prête');
  }
});

module.exports = db;
