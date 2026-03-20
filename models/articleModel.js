const db = require('../database/db');

const Article = {
  // 1. CRÉER un article
  create: (article, callback) => {
    const { titre, contenu, auteur, categorie, tags } = article;
    const tagsJSON = tags ? JSON.stringify(tags) : null;
    
    db.run(
      `INSERT INTO articles (titre, contenu, auteur, categorie, tags) 
       VALUES (?, ?, ?, ?, ?)`,
      [titre, contenu, auteur, categorie, tagsJSON],
      function(err) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, { id: this.lastID });
        }
      }
    );
  },
  
  // 2. LIRE TOUS les articles
  findAll: (callback) => {
    db.all(`SELECT * FROM articles ORDER BY date DESC`, [], (err, rows) => {
      if (err) {
        callback(err, null);
      } else {
        rows.forEach(row => {
          if (row.tags) {
            try {
              row.tags = JSON.parse(row.tags);
            } catch (e) {
              row.tags = [];
            }
          }
        });
        callback(null, rows);
      }
    });
  },
  
  // 3. LIRE UN article par ID
  findById: (id, callback) => {
    db.get(`SELECT * FROM articles WHERE id = ?`, [id], (err, row) => {
      if (err) {
        callback(err, null);
      } else if (row && row.tags) {
        try {
          row.tags = JSON.parse(row.tags);
        } catch (e) {
          row.tags = [];
        }
        callback(null, row);
      } else {
        callback(null, row);
      }
    });
  },
  
  // 4. MODIFIER un article
  update: (id, article, callback) => {
    const { titre, contenu, categorie, tags } = article;
    const tagsJSON = tags ? JSON.stringify(tags) : null;
    
    db.run(
      `UPDATE articles 
       SET titre = ?, contenu = ?, categorie = ?, tags = ? 
       WHERE id = ?`,
      [titre, contenu, categorie, tagsJSON, id],
      function(err) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, { changes: this.changes });
        }
      }
    );
  },
  
  // 5. SUPPRIMER un article
  delete: (id, callback) => {
    db.run(`DELETE FROM articles WHERE id = ?`, [id], function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { changes: this.changes });
      }
    });
  },
  
  // 6. RECHERCHER des articles
  search: (query, callback) => {
    db.all(
      `SELECT * FROM articles 
       WHERE titre LIKE ? OR contenu LIKE ?
       ORDER BY date DESC`,
      [`%${query}%`, `%${query}%`],
      (err, rows) => {
        if (err) {
          callback(err, null);
        } else {
          rows.forEach(row => {
            if (row.tags) {
              try {
                row.tags = JSON.parse(row.tags);
              } catch (e) {
                row.tags = [];
              }
            }
          });
          callback(null, rows);
        }
      }
    );
  }
};

module.exports = Article;
