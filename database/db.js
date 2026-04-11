const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'blog.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur de connexion:', err.message);
  } else {
    console.log('✅ Connecté à SQLite');
  }
});

// Table des articles
db.run(`
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
`, (err) => {
  if (err) {
    console.error('❌ Erreur création table articles:', err.message);
  } else {
    console.log('✅ Table articles prête');
  }
});

// Table newsletter
db.run(`
  CREATE TABLE IF NOT EXISTS newsletter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    date_inscription TEXT DEFAULT CURRENT_DATE
  )
`, (err) => {
  if (err) console.error('❌ Erreur table newsletter:', err.message);
  else console.log('✅ Table newsletter prête');
});

// Table commentaires
db.run(`
  CREATE TABLE IF NOT EXISTS commentaires (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    pseudo TEXT NOT NULL,
    contenu TEXT NOT NULL,
    date TEXT DEFAULT CURRENT_DATE,
    valide INTEGER DEFAULT 0,
    FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE
  )
`, (err) => {
  if (err) console.error('❌ Erreur table commentaires:', err.message);
  else console.log('✅ Table commentaires prête');
});

// Table likes
db.run(`
  CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    ip TEXT NOT NULL,
    date TEXT DEFAULT CURRENT_DATE,
    UNIQUE(article_id, ip),
    FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE
  )
`, (err) => {
  if (err) console.error('❌ Erreur table likes:', err.message);
  else console.log('✅ Table likes prête');
});

// Table vues
db.run(`
  CREATE TABLE IF NOT EXISTS vues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    ip TEXT NOT NULL,
    date TEXT DEFAULT CURRENT_DATE,
    FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE
  )
`, (err) => {
  if (err) console.error('❌ Erreur table vues:', err.message);
  else console.log('✅ Table vues prête');
});

module.exports = db;
