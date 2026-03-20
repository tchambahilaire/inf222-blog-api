const Article = require('../models/articleModel');

// 1. CRÉER un article
exports.createArticle = (req, res) => {
  const { titre, contenu, auteur, categorie, tags } = req.body;
  
  if (!titre || !contenu || !auteur) {
    return res.status(400).json({ 
      error: 'Les champs titre, contenu et auteur sont obligatoires.' 
    });
  }
  
  Article.create({ titre, contenu, auteur, categorie, tags }, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    res.status(201).json({
      message: 'Article créé avec succès',
      articleId: result.id
    });
  });
};

// 2. LIRE TOUS les articles
exports.getAllArticles = (req, res) => {
  Article.findAll((err, articles) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(articles);
  });
};

// 3. LIRE UN article par ID
exports.getArticleById = (req, res) => {
  const id = req.params.id;
  
  Article.findById(id, (err, article) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (!article) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }
    res.json(article);
  });
};

// 4. MODIFIER un article
exports.updateArticle = (req, res) => {
  const id = req.params.id;
  const { titre, contenu, categorie, tags } = req.body;
  
  Article.findById(id, (err, article) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (!article) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }
    
    Article.update(id, { titre, contenu, categorie, tags }, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.json({ message: 'Article mis à jour avec succès' });
    });
  });
};

// 5. SUPPRIMER un article
exports.deleteArticle = (req, res) => {
  const id = req.params.id;
  
  Article.findById(id, (err, article) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (!article) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }
    
    Article.delete(id, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.json({ message: 'Article supprimé avec succès' });
    });
  });
};

// 6. RECHERCHER des articles
exports.searchArticles = (req, res) => {
  const query = req.query.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Paramètre "query" requis' });
  }
  
  Article.search(query, (err, articles) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(articles);
  });
};
