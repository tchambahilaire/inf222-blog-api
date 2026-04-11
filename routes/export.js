const express = require('express');
const router = express.Router();
const db = require('../database/db');
const PDFDocument = require('html-pdf');

// Exporter un article en PDF
router.get('/article/:id/pdf', (req, res) => {
  const id = req.params.id;
  
  db.get(`SELECT * FROM articles WHERE id = ?`, [id], (err, article) => {
    if (err || !article) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }
    
    let tagsHtml = '';
    if (article.tags) {
      try {
        const tags = JSON.parse(article.tags);
        tagsHtml = `<div style="margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 8px;">🏷️ Tags : ${tags.map(t => `#${t}`).join(' · ')}</div>`;
      } catch(e) {}
    }
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${escapeHtml(article.titre)}</title>
        <style>
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            padding: 40px; 
            max-width: 800px; 
            margin: 0 auto; 
            line-height: 1.6;
          }
          h1 { 
            color: #667eea; 
            border-bottom: 3px solid #667eea; 
            padding-bottom: 10px;
          }
          .meta { 
            color: #888; 
            margin-bottom: 20px; 
            padding-bottom: 10px; 
            border-bottom: 1px solid #eee;
            font-size: 14px;
          }
          .content { 
            color: #333; 
            font-size: 16px;
          }
          .footer { 
            margin-top: 50px; 
            padding-top: 20px; 
            border-top: 1px solid #eee; 
            font-size: 12px; 
            color: #888; 
            text-align: center; 
          }
          .article-image { 
            width: 100%; 
            max-height: 400px; 
            object-fit: cover; 
            margin-bottom: 20px; 
            border-radius: 10px; 
          }
        </style>
      </head>
      <body>
        ${article.image ? `<img src="${article.image}" class="article-image">` : ''}
        <h1>${escapeHtml(article.titre)}</h1>
        <div class="meta">
          👤 Auteur : ${escapeHtml(article.auteur)} | 📅 Date : ${article.date} | 📁 Catégorie : ${escapeHtml(article.categorie || 'Non catégorisé')}
        </div>
        <div class="content">
          ${escapeHtml(article.contenu)}
        </div>
        ${tagsHtml}
        <div class="footer">
          Généré par Blog Manager Pro - ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
        </div>
      </body>
      </html>
    `;
    
    function escapeHtml(text) {
      if (!text) return '';
      return text.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
      }).replace(/\n/g, '<br>');
    }
    
    PDFDocument.create(html, { format: 'A4' }).toBuffer((err, buffer) => {
      if (err) return res.status(500).json({ error: 'Erreur génération PDF' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=article_${id}.pdf`);
      res.send(buffer);
    });
  });
});

// Exporter tous les articles en JSON
router.get('/all/json', (req, res) => {
  db.all(`SELECT * FROM articles ORDER BY date DESC`, [], (err, articles) => {
    if (err) return res.status(500).json({ error: 'Erreur export' });
    
    const exportData = {
      exportDate: new Date().toISOString(),
      site: "Blog Manager Pro",
      totalArticles: articles.length,
      articles: articles.map(a => ({
        id: a.id,
        titre: a.titre,
        contenu: a.contenu,
        auteur: a.auteur,
        date: a.date,
        categorie: a.categorie,
        tags: a.tags ? JSON.parse(a.tags) : [],
        image: a.image,
        vues: a.total_vues || 0
      }))
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=articles_export.json');
    res.json(exportData);
  });
});

// Exporter les statistiques en CSV
router.get('/stats/csv', (req, res) => {
  db.all(`SELECT * FROM articles ORDER BY date DESC`, [], (err, articles) => {
    if (err) return res.status(500).json({ error: 'Erreur export' });
    
    let csv = "ID;Titre;Auteur;Date;Catégorie;Tags;Vues\n";
    articles.forEach(a => {
      csv += `${a.id};"${a.titre.replace(/"/g, '""')}";${a.auteur};${a.date};${a.categorie || ''};"${a.tags || ''}";${a.total_vues || 0}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=statistiques_blog.csv');
    res.send(csv);
  });
});

module.exports = router;
