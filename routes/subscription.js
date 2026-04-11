const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Ajouter colonnes d'abonnement aux users
db.run(`ALTER TABLE users ADD COLUMN subscription_plan TEXT DEFAULT 'free'`, (err) => {});
db.run(`ALTER TABLE users ADD COLUMN subscription_expiry TEXT`, (err) => {});

// Plans disponibles
const plans = {
  free: { 
    price: 0, 
    name: 'Gratuit', 
    articles_limit: 5,
    features: ['📝 5 articles maximum', '💬 Commentaires', '📧 Newsletter', '🔍 Recherche']
  },
  pro: { 
    price: 5000, 
    name: 'Pro', 
    articles_limit: -1,
    features: ['✅ Articles illimités', '✅ Support prioritaire', '✅ Export PDF/JSON', '✅ Statistiques avancées', '✅ Pas de publicité']
  },
  premium: { 
    price: 10000, 
    name: 'Premium', 
    articles_limit: -1,
    features: ['✅ Articles illimités', '✅ Support 24/7', '✅ Export PDF/JSON/CSV', '✅ Statistiques avancées', '✅ API publique', '✅ Multi-auteurs', '✅ Articles premium inclus']
  }
};

// Obtenir l'abonnement d'un utilisateur
router.get('/user/:userId', (req, res) => {
  db.get(`SELECT subscription_plan, subscription_expiry FROM users WHERE id = ?`, [req.params.userId], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    
    const isActive = user.subscription_expiry && new Date(user.subscription_expiry) > new Date();
    res.json({
      plan: user.subscription_plan || 'free',
      isActive: isActive && user.subscription_plan !== 'free',
      expiry: user.subscription_expiry,
      features: plans[user.subscription_plan || 'free']?.features || plans.free.features
    });
  });
});

// Obtenir les plans disponibles
router.get('/plans', (req, res) => {
  res.json(plans);
});

// Créer un paiement d'abonnement (initie le paiement)
router.post('/init-payment', (req, res) => {
  const { plan, userId, email } = req.body;
  
  if (!plan || !plans[plan]) {
    return res.status(400).json({ error: 'Plan invalide' });
  }
  
  if (!userId && !email) {
    return res.status(400).json({ error: 'Utilisateur ou email requis' });
  }
  
  const paymentId = `SUB_${plan}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const amount = plans[plan].price;
  
  // Créer une transaction en attente
  db.run(`
    INSERT INTO transactions (id, montant, email, subscription_plan, status, type, date)
    VALUES (?, ?, ?, ?, 'pending', 'subscription', datetime('now'))
  `, [paymentId, amount, email, plan]);
  
  res.json({
    paymentId,
    amount,
    plan,
    planName: plans[plan].name,
    features: plans[plan].features
  });
});

// Webhook pour confirmer le paiement (appelé après paiement réussi)
router.post('/confirm-payment', (req, res) => {
  const { paymentId, transactionId, email, plan } = req.body;
  
  if (!paymentId || !email) {
    return res.status(400).json({ error: 'Données manquantes' });
  }
  
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 1);
  
  db.run(`
    UPDATE users SET subscription_plan = ?, subscription_expiry = ? WHERE email = ?
  `, [plan, expiryDate.toISOString(), email], (err) => {
    if (err) return res.status(500).json({ error: 'Erreur mise à jour' });
    
    db.run(`UPDATE transactions SET status = 'completed', transaction_id = ? WHERE id = ?`, [transactionId, paymentId]);
    
    res.json({ success: true, message: 'Abonnement activé', expiry: expiryDate });
  });
});

module.exports = router;
