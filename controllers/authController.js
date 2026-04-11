const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const SECRET = 'votre_cle_secrete_2024';

exports.register = (req, res) => {
  const { nom, email, motdepasse } = req.body;
  if (!nom || !email || !motdepasse) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  User.create({ nom, email, motdepasse }, (err) => {
    if (err) return res.status(400).json({ error: 'Email déjà utilisé' });
    res.status(201).json({ message: 'Inscription réussie' });
  });
};

exports.login = (req, res) => {
  const { email, motdepasse } = req.body;
  User.findByEmail(email, (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    User.verifyPassword(motdepasse, user.motdepasse, (err, isValid) => {
      if (!isValid) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, nom: user.nom, email: user.email, role: user.role } });
    });
  });
};

exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Non autorisé' });
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Token invalide' });
    req.user = decoded;
    next();
  });
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès réservé aux admins' });
  next();
};
