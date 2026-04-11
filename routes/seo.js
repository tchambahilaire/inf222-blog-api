const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Générer le sitemap.xml
router.get('/sitemap.xml', (req, res) => {
  db.all(`SELECT id, date, titre FROM articles ORDER BY date DESC`, [], (err, articles) => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    xml += '  <url>\n';
    xml += '    <loc>https://blogpro.com/</loc>\n';
    xml += '    <priority>1.0</priority>\n';
    xml += '  </url>\n';
    xml += '  <url>\n';
    xml += '    <loc>https://blogpro.com/articles</loc>\n';
    xml += '    <priority>0.9</priority>\n';
    xml += '  </url>\n';
    
    if (articles) {
      articles.forEach(a => {
        xml += '  <url>\n';
        xml += `    <loc>https://blogpro.com/article/${a.id}</loc>\n`;
        xml += `    <lastmod>${a.date}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += '  </url>\n';
      });
    }
    
    xml += '</urlset>';
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  });
});

// Générer les balises meta pour un article
router.get('/meta/:id', (req, res) => {
  db.get(`SELECT titre, contenu, auteur, date, image FROM articles WHERE id = ?`, [req.params.id], (err, article) => {
    if (err || !article) return res.status(404).json({ error: 'Article non trouvé' });
    
    const meta = {
      title: article.titre,
      description: article.contenu.substring(0, 160),
      author: article.auteur,
      image: article.image || '/default-image.jpg',
      url: `https://blogpro.com/article/${req.params.id}`,
      type: 'article'
    };
    res.json(meta);
  });
});

// robots.txt
router.get('/robots.txt', (req, res) => {
  const robots = `User-agent: *
Allow: /
Sitemap: https://blogpro.com/api/seo/sitemap.xml`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

module.exports = router;
