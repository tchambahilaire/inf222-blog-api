const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Base de connaissances pour la génération d'articles
const templates = {
  technologie: {
    titres: [
      "Les innovations technologiques de 2024",
      "Comment la technologie transforme notre quotidien",
      "Les tendances tech à suivre cette année",
      "L'impact de l'IA sur le développement web",
      "Node.js vs Python : quel choix pour votre projet ?"
    ],
    contenus: [
      "La technologie évolue à une vitesse fulgurante. Dans cet article, nous explorons les dernières innovations qui vont transformer notre façon de travailler et de vivre. De l'intelligence artificielle aux objets connectés, en passant par le cloud computing, découvrez comment ces technologies façonnent notre avenir.",
      "Le monde du développement web ne cesse d'évoluer. Les frameworks modernes comme Node.js, React et Vue.js permettent de créer des applications toujours plus performantes. Dans ce guide, nous vous aidons à choisir les bonnes technologies pour vos projets.",
      "L'intelligence artificielle révolutionne le secteur du développement. Les outils comme ChatGPT et Gemini permettent d'automatiser de nombreuses tâches et d'améliorer la productivité des développeurs. Découvrez comment intégrer l'IA dans vos projets."
    ],
    tags: ["technologie", "innovation", "digital", "futur"]
  },
  programmation: {
    titres: [
      "Les bases de la programmation expliquées",
      "Guide complet pour débuter en JavaScript",
      "Les meilleures pratiques de code",
      "Comment devenir développeur en 2024",
      "API REST : tout ce que vous devez savoir"
    ],
    contenus: [
      "La programmation est une compétence essentielle dans le monde moderne. Que vous soyez débutant ou confirmé, cet article vous aidera à progresser. Nous couvrons les concepts fondamentaux, les langages populaires et les ressources pour apprendre efficacement.",
      "JavaScript est le langage le plus utilisé sur le web. Dans ce tutoriel complet, nous apprenons les bases de JavaScript, de Node.js et comment créer votre première application. Pas de prérequis nécessaire !",
      "Une API REST bien conçue est essentielle pour vos applications web. Découvrez les bonnes pratiques pour créer des API robustes, sécurisées et faciles à utiliser. Exemples concrets avec Node.js et Express."
    ],
    tags: ["programmation", "javascript", "nodejs", "api"]
  },
  business: {
    titres: [
      "Comment réussir son blog professionnel",
      "Stratégies de contenu pour attirer des clients",
      "Monétiser son blog : guide pratique",
      "Les secrets d'un blog rentable",
      "Comment gagner de l'argent avec votre blog"
    ],
    contenus: [
      "Un blog professionnel peut être un excellent outil pour développer votre entreprise. Dans cet article, nous partageons des conseils pratiques pour créer du contenu qui attire et convertit vos visiteurs en clients.",
      "La monétisation d'un blog est un objectif atteignable avec les bonnes stratégies. Publicité, affiliés, produits numériques, services... Découvrez les différentes façons de générer des revenus avec votre blog.",
      "Le marketing de contenu est essentiel pour attirer votre audience. Apprenez à créer des articles qui répondent aux besoins de vos lecteurs et qui vous positionnent comme expert dans votre domaine."
    ],
    tags: ["business", "marketing", "monetisation", "blogging"]
  },
  general: {
    titres: [
      "Bienvenue sur Blog Manager Pro",
      "Comment utiliser notre plateforme",
      "Tutoriel : Créer votre premier article",
      "Les fonctionnalités de votre blog",
      "Guide d'utilisation pour débutants"
    ],
    contenus: [
      "Blog Manager Pro est la solution idéale pour gérer votre blog. Dans cet article, nous vous présentons toutes les fonctionnalités de la plateforme et comment les utiliser pour créer du contenu de qualité.",
      "Créer un article n'a jamais été aussi simple ! Suivez ce guide pas à pas pour publier votre premier contenu. Nous vous montrons comment ajouter du texte, des images, des tags et optimiser votre article pour le SEO.",
      "Votre blog est maintenant prêt ! Découvrez comment personnaliser l'apparence, gérer vos commentaires, analyser vos statistiques et interagir avec votre audience grâce à notre plateforme intuitive."
    ],
    tags: ["tutoriel", "guide", "blogging", "debutant"]
  }
};

// Analyser le sujet et choisir la catégorie
const detectCategory = (sujet) => {
  const s = sujet.toLowerCase();
  if (s.match(/tech|informatique|programmation|code|logiciel|app|site web|node|javascript|api|react|vue|python|php/)) {
    return 'programmation';
  }
  if (s.match(/business|entreprise|marketing|vente|client|monetiser|argent|revenu|professionnel/)) {
    return 'business';
  }
  if (s.match(/innovation|futur|nouvelle tech|intelligence artificielle|ia|robot|digital/)) {
    return 'technologie';
  }
  return 'general';
};

// Générer un article
const genererArticle = (sujet, categorie = null) => {
  const cat = categorie || detectCategory(sujet);
  const template = templates[cat] || templates.general;
  
  const titre = template.titres[Math.floor(Math.random() * template.titres.length)];
  let contenu = template.contenus[Math.floor(Math.random() * template.contenus.length)];
  
  // Personnaliser le contenu avec le sujet
  if (sujet && !categorie) {
    contenu = contenu.replace(/technologies|développement web|programmation/gi, sujet);
    contenu += `\n\n🔍 En résumé sur "${sujet}" : cet article vous a présenté les bases pour bien débuter. N'hésitez pas à laisser un commentaire si vous avez des questions !`;
  }
  
  const tags = [...template.tags];
  if (sujet && !categorie) tags.unshift(sujet.toLowerCase());
  
  return {
    titre,
    contenu,
    tags: tags.slice(0, 5),
    categorie: cat
  };
};

// API de génération
router.post('/generate', (req, res) => {
  const { sujet, categorie } = req.body;
  
  if (!sujet && !categorie) {
    return res.status(400).json({ error: 'Un sujet ou une catégorie est requis' });
  }
  
  const article = genererArticle(sujet || categorie, categorie);
  res.json(article);
});

// Générer plusieurs idées d'articles
router.post('/ideas', (req, res) => {
  const { sujet, count = 5 } = req.body;
  const ideas = [];
  
  for (let i = 0; i < Math.min(count, 10); i++) {
    const article = genererArticle(sujet || 'blog');
    ideas.push({
      titre: article.titre,
      categorie: article.categorie,
      tags: article.tags
    });
  }
  
  res.json({ ideas });
});

// Améliorer un texte existant
router.post('/improve', (req, res) => {
  const { texte, type } = req.body;
  
  if (!texte) {
    return res.status(400).json({ error: 'Texte requis' });
  }
  
  let result = texte;
  
  if (type === 'titre') {
    result = texte.charAt(0).toUpperCase() + texte.slice(1);
    if (!result.endsWith('?')) result += ' ?';
  } else if (type === 'contenu') {
    result = texte.trim();
    if (!result.endsWith('.') && !result.endsWith('!') && !result.endsWith('?')) result += '.';
  }
  
  res.json({ original: texte, improved: result });
});

module.exports = router;
