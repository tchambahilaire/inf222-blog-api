const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { upload } = require('../middlewares/upload');

router.get('/test', (req, res) => {
  res.json({ 
    message: 'Route des articles OK',
    timestamp: new Date().toISOString()
  });
});

router.post('/', upload.single('image'), articleController.createArticle);
router.get('/', articleController.getAllArticles);
router.get('/search', articleController.searchArticles);
router.get('/stats/global', articleController.getGlobalStats);
router.get('/top', articleController.getTopArticles);
router.get('/tags/stats', articleController.getTagsStats);
router.get('/:id', articleController.getArticleById);
router.put('/:id', articleController.updateArticle);
router.delete('/:id', articleController.deleteArticle);
router.post('/:id/like', articleController.likeArticle);
router.get('/:id/likes', articleController.getLikesCount);
router.post('/:id/view', articleController.addView);

module.exports = router;
