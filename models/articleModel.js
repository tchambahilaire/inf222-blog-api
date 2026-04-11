const db = require('../database/db');

const Article = {
  create: (article, callback) => {
    const { titre, contenu, auteur, categorie, tags, image } = article;
    const tagsJSON = tags ? JSON.stringify(tags) : null;
    
    db.run(
      `INSERT INTO articles (titre, contenu, auteur, categorie, tags, image) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [titre, contenu, auteur, categorie, tagsJSON, image || null],
      function(err) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, { id: this.lastID });
        }
      }
    );
  },
  
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
  
  update: (id, article, callback) => {
    const { titre, contenu, categorie, tags, image } = article;
    const tagsJSON = tags ? JSON.stringify(tags) : null;
    
    db.run(
      `UPDATE articles 
       SET titre = ?, contenu = ?, categorie = ?, tags = ?, image = ? 
       WHERE id = ?`,
      [titre, contenu, categorie, tagsJSON, image || null, id],
      function(err) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, { changes: this.changes });
        }
      }
    );
  },
  
  delete: (id, callback) => {
    db.run(`DELETE FROM articles WHERE id = ?`, [id], function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { changes: this.changes });
      }
    });
  },
  
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
  },
  
  addLike: (id, ip, callback) => {
    db.run(
      `INSERT INTO likes (article_id, ip) VALUES (?, ?)`,
      [id, ip],
      function(err) {
        if (err && err.message.includes('UNIQUE')) {
          callback({ error: 'Déjà liké' }, null);
        } else {
          callback(null, { liked: true });
        }
      }
    );
  },
  
  countLikes: (id, callback) => {
    db.get(`SELECT COUNT(*) as total FROM likes WHERE article_id = ?`, [id], callback);
  },
  
  hasLiked: (id, ip, callback) => {
    db.get(`SELECT * FROM likes WHERE article_id = ? AND ip = ?`, [id, ip], (err, row) => {
      callback(err, !!row);
    });
  },
  
  addView: (id, ip, callback) => {
    db.run(`INSERT INTO vues (article_id, ip) VALUES (?, ?)`, [id, ip], (err) => {
      if (!err) {
        db.run(`UPDATE articles SET total_vues = (SELECT COUNT(*) FROM vues WHERE article_id = ?) WHERE id = ?`, [id, id]);
      }
      callback(err, null);
    });
  },
  
  getGlobalStats: (callback) => {
    db.get(`
      SELECT 
        (SELECT COUNT(*) FROM articles) as total_articles,
        (SELECT COUNT(*) FROM newsletter) as total_abonnes,
        (SELECT COUNT(*) FROM commentaires WHERE valide = 1) as total_commentaires,
        (SELECT COUNT(*) FROM likes) as total_likes,
        (SELECT SUM(total_vues) FROM articles) as total_vues
    `, [], callback);
  },
  
  getTopArticles: (limit, callback) => {
    db.all(`
      SELECT id, titre, total_vues, image FROM articles 
      ORDER BY total_vues DESC LIMIT ?
    `, [limit], callback);
  },
  
  getTagsStats: (callback) => {
    db.all(`SELECT tags FROM articles WHERE tags IS NOT NULL`, [], (err, rows) => {
      if (err) {
        callback(err, null);
      } else {
        const tagCount = {};
        rows.forEach(row => {
          try {
            const tags = JSON.parse(row.tags);
            tags.forEach(tag => {
              tagCount[tag] = (tagCount[tag] || 0) + 1;
            });
          } catch(e) {}
        });
        callback(null, tagCount);
      }
    });
  }
};

module.exports = Article;
