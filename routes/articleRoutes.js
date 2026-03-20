const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

// Route de test
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Route des articles OK',
    timestamp: new Date().toISOString()
  });
});

// Routes principales
router.post('/', articleController.createArticle);           // 1. Créer
router.get('/', articleController.getAllArticles);           // 2. Lire tous
router.get('/search', articleController.searchArticles);     // 6. Rechercher (AVANT /:id)
router.get('/:id', articleController.getArticleById);        // 3. Lire un
router.put('/:id', articleController.updateArticle);         // 4. Modifier
router.delete('/:id', articleController.deleteArticle);      // 5. Supprimer

module.exports = router;
