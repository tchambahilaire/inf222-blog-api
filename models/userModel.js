const db = require('../database/db');
const bcrypt = require('bcrypt');

const User = {
  create: (user, callback) => {
    const { nom, email, motdepasse, role } = user;
    bcrypt.hash(motdepasse, 10, (err, hash) => {
      if (err) return callback(err);
      db.run(`INSERT INTO users (nom, email, motdepasse, role) VALUES (?, ?, ?, ?)`,
        [nom, email, hash, role || 'user'], function(err) {
          callback(err, { id: this?.lastID });
        });
    });
  },
  findByEmail: (email, callback) => {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], callback);
  },
  findById: (id, callback) => {
    db.get(`SELECT id, nom, email, role FROM users WHERE id = ?`, [id], callback);
  },
  verifyPassword: (password, hash, callback) => {
    bcrypt.compare(password, hash, callback);
  }
};

module.exports = User;
