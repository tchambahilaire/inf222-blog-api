const express = require('express');
const router = express.Router();
const db = require('../database/db');
const crypto = require('crypto');

// ========== ORANGE MONEY ==========
const processOrangeMoney = async (telephone, montant, reference) => {
  console.log(`💰 Orange Money: ${montant} FCFA vers ${telephone} - Réf: ${reference}`);
  await new Promise(resolve => setTimeout(resolve, 2000));
  const success = Math.random() > 0.1;
  return {
    success,
    transactionId: `OM_${Date.now()}_${reference}`,
    message: success ? 'Paiement Orange Money réussi' : 'Échec du paiement'
  };
};

// ========== MTN MOBILE MONEY ==========
const processMTNMoney = async (telephone, montant, reference) => {
  console.log(`💰 MTN Money: ${montant} FCFA vers ${telephone} - Réf: ${reference}`);
  await new Promise(resolve => setTimeout(resolve, 2000));
  const success = Math.random() > 0.1;
  return {
    success,
    transactionId: `MTN_${Date.now()}_${reference}`,
    message: success ? 'Paiement MTN Mobile Money réussi' : 'Échec du paiement MTN'
  };
};

// ========== PAIEMENT PAR COMPTE BANCAIRE ==========
const processBankTransfer = async (iban, montant, reference) => {
  console.log(`💰 Virement bancaire: ${montant} FCFA vers IBAN: ${iban} - Réf: ${reference}`);
  await new Promise(resolve => setTimeout(resolve, 3000));
  const success = Math.random() > 0.1;
  return {
    success,
    transactionId: `BNK_${Date.now()}_${reference}`,
    message: success ? 'Virement bancaire enregistré' : 'Échec du virement'
  };
};

// ========== PAIEMENT ORANGE MONEY ==========
router.post('/orange-money', async (req, res) => {
  const { montant, telephone, article_id, subscription_plan, email } = req.body;
  
  if (!montant || !telephone) {
    return res.status(400).json({ error: 'Montant et téléphone requis' });
  }
  
  if (!telephone.match(/^[6-7][0-9]{8}$/)) {
    return res.status(400).json({ error: 'Numéro Orange Money invalide (ex: 612345678)' });
  }
  
  const reference = subscription_plan ? `SUB_${subscription_plan}_${Date.now()}` : `ART_${article_id}_${Date.now()}`;
  
  try {
    const result = await processOrangeMoney(telephone, montant, reference);
    
    db.run(`
      INSERT INTO transactions (id, montant, telephone, email, article_id, subscription_plan, status, type, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'orange_money', datetime('now'))
    `, [result.transactionId, montant, telephone, email, article_id, subscription_plan, result.success ? 'completed' : 'failed']);
    
    if (result.success) {
      if (article_id) {
        db.run(`UPDATE articles SET premium = 1 WHERE id = ?`, [article_id]);
      }
      if (subscription_plan && email) {
        // Mettre à jour l'abonnement de l'utilisateur
        db.run(`UPDATE users SET subscription_plan = ?, subscription_expiry = datetime('now', '+1 month') WHERE email = ?`, [subscription_plan, email]);
      }
    }
    
    res.json({
      success: result.success,
      transactionId: result.transactionId,
      message: result.message,
      type: subscription_plan ? 'subscription' : 'article'
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du paiement Orange Money' });
  }
});

// ========== PAIEMENT MTN MOBILE MONEY ==========
router.post('/mtn-money', async (req, res) => {
  const { montant, telephone, article_id, subscription_plan, email } = req.body;
  
  if (!montant || !telephone) {
    return res.status(400).json({ error: 'Montant et téléphone requis' });
  }
  
  if (!telephone.match(/^[6-7][0-9]{8}$/)) {
    return res.status(400).json({ error: 'Numéro MTN Mobile Money invalide (ex: 612345678)' });
  }
  
  const reference = subscription_plan ? `SUB_${subscription_plan}_${Date.now()}` : `ART_${article_id}_${Date.now()}`;
  
  try {
    const result = await processMTNMoney(telephone, montant, reference);
    
    db.run(`
      INSERT INTO transactions (id, montant, telephone, email, article_id, subscription_plan, status, type, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'mtn_money', datetime('now'))
    `, [result.transactionId, montant, telephone, email, article_id, subscription_plan, result.success ? 'completed' : 'failed']);
    
    if (result.success) {
      if (article_id) {
        db.run(`UPDATE articles SET premium = 1 WHERE id = ?`, [article_id]);
      }
      if (subscription_plan && email) {
        db.run(`UPDATE users SET subscription_plan = ?, subscription_expiry = datetime('now', '+1 month') WHERE email = ?`, [subscription_plan, email]);
      }
    }
    
    res.json({
      success: result.success,
      transactionId: result.transactionId,
      message: result.message,
      type: subscription_plan ? 'subscription' : 'article'
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du paiement MTN Mobile Money' });
  }
});

// ========== PAIEMENT PAR COMPTE BANCAIRE ==========
router.post('/bank-transfer', async (req, res) => {
  const { montant, iban, titulaire, banque, article_id, subscription_plan, email } = req.body;
  
  if (!montant || !iban || !titulaire) {
    return res.status(400).json({ error: 'Montant, IBAN et titulaire requis' });
  }
  
  const reference = subscription_plan ? `SUB_${subscription_plan}_${Date.now()}` : `BNK_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  
  try {
    const result = await processBankTransfer(iban, montant, reference);
    
    db.run(`
      INSERT INTO transactions (id, montant, iban, titulaire, banque, email, article_id, subscription_plan, status, type, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'bank_transfer', datetime('now'))
    `, [result.transactionId, montant, iban, titulaire, banque, email, article_id, subscription_plan, result.success ? 'completed' : 'pending']);
    
    if (result.success) {
      if (article_id) {
        db.run(`UPDATE articles SET premium = 1 WHERE id = ?`, [article_id]);
      }
      if (subscription_plan && email) {
        db.run(`UPDATE users SET subscription_plan = ?, subscription_expiry = datetime('now', '+1 month') WHERE email = ?`, [subscription_plan, email]);
      }
    }
    
    res.json({
      success: result.success,
      transactionId: result.transactionId,
      message: result.success ? 'Virement bancaire enregistré' : 'En attente de confirmation',
      bankInfo: {
        beneficiary: 'Blog Manager Pro',
        iban: 'CM21 0000 0000 0000 0000 0000 001',
        bic: 'BICMCM21',
        bank: 'Société Générale Cameroun'
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du virement bancaire' });
  }
});

// ========== VÉRIFIER STATUT TRANSACTION ==========
router.get('/status/:id', (req, res) => {
  db.get(`SELECT * FROM transactions WHERE id = ?`, [req.params.id], (err, transaction) => {
    if (err || !transaction) {
      return res.status(404).json({ error: 'Transaction non trouvée' });
    }
    res.json(transaction);
  });
});

// ========== LISTE DES TRANSACTIONS (ADMIN) ==========
router.get('/transactions', (req, res) => {
  db.all(`SELECT * FROM transactions ORDER BY date DESC`, [], (err, transactions) => {
    if (err) return res.status(500).json({ error: 'Erreur' });
    res.json(transactions);
  });
});

// ========== STATISTIQUES DES PAIEMENTS ==========
router.get('/stats', (req, res) => {
  db.get(`
    SELECT 
      SUM(CASE WHEN status = 'completed' AND type = 'orange_money' THEN montant ELSE 0 END) as total_orange,
      SUM(CASE WHEN status = 'completed' AND type = 'mtn_money' THEN montant ELSE 0 END) as total_mtn,
      SUM(CASE WHEN status = 'completed' AND type = 'bank_transfer' THEN montant ELSE 0 END) as total_bank,
      SUM(CASE WHEN status = 'completed' THEN montant ELSE 0 END) as total,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as total_transactions
    FROM transactions
  `, [], (err, stats) => {
    res.json(stats || { total_orange: 0, total_mtn: 0, total_bank: 0, total: 0, total_transactions: 0 });
  });
});

module.exports = router;
