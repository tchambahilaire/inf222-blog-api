const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Limiter les requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Trop de requêtes, veuillez réessayer plus tard' }
});

// Limite plus stricte pour les routes sensibles
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Trop de tentatives de connexion' }
});

// Middleware de sécurité
const securityMiddleware = [helmet(), limiter];

module.exports = { securityMiddleware, authLimiter };
