const Article = require('../models/articleModel');
const { optimizeImage } = require('../middlewares/upload');
const { v4: uuidv4 } = require('uuid');

exports.createArticle = async (req, res) => {
  try {
    const { titre, contenu, auteur, categorie, tags } = req.body;
    let imageUrl = null;
    
    if (!titre || !contenu || !auteur) {
      return res.status(400).json({ 
        error: 'Les champs titre, contenu et auteur sont obligatoires.' 
      });
    }
    
    if (req.file) {
      const filename = `${Date.now()}-${uuidv4()}.jpg`;
      imageUrl = await optimizeImage(req.file, filename);
    }
    
    const tagsArray = tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [];
    
    Article.create({ titre, contenu, auteur, categorie, tags: tagsArray, image: imageUrl }, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      res.status(201).json({
        message: 'Article créé avec succès',
        articleId: result.id,
        image: imageUrl
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de l\'upload' });
  }
};

exports.getAllArticles = (req, res) => {
  Article.findAll((err, articles) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(articles);
  });
};

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

exports.likeArticle = (req, res) => {
  const id = req.params.id;
  const ip = req.ip || req.connection.remoteAddress;
  
  Article.hasLiked(id, ip, (err, liked) => {
    if (liked) {
      return res.status(400).json({ error: 'Vous avez déjà liké cet article' });
    }
    
    Article.addLike(id, ip, (err) => {
      if (err) return res.status(500).json({ error: 'Erreur' });
      res.json({ message: 'Article liké !' });
    });
  });
};

exports.getLikesCount = (req, res) => {
  Article.countLikes(req.params.id, (err, count) => {
    res.json({ likes: count?.total || 0 });
  });
};

exports.addView = (req, res) => {
  const id = req.params.id;
  const ip = req.ip || req.connection.remoteAddress;
  Article.addView(id, ip, () => {});
  res.json({ message: 'Vue enregistrée' });
};

exports.getGlobalStats = (req, res) => {
  Article.getGlobalStats((err, stats) => {
    res.json(stats);
  });
};

exports.getTopArticles = (req, res) => {
  const limit = req.query.limit || 5;
  Article.getTopArticles(limit, (err, articles) => {
    res.json(articles);
  });
};

exports.getTagsStats = (req, res) => {
  Article.getTagsStats((err, stats) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(stats);
  });
};
