require('dotenv').config();

const express = require('express');
const app = express();
const port = 3000;

// Base de données
const db = require('./database/db');

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('public/uploads'));

// Sécurité (Niveau 9)
const { securityMiddleware, authLimiter } = require('./middleware/security');
app.use(securityMiddleware);

// Routes existantes
const articleRoutes = require('./routes/articleRoutes');
const newsletterRoutes = require('./routes/newsletter');
const commentRoutes = require('./routes/commentRoutes');
const authRoutes = require('./routes/authRoutes');

// Niveaux 4 et 5
const chatbotRoutes = require('./routes/chatbot');
const exportRoutes = require('./routes/export');
const paymentRoutes = require('./routes/payment');
const saasRoutes = require('./routes/saas');
const notificationRoutes = require('./routes/notifications');

// Niveaux 6 à 10
const googleAuthRoutes = require('./routes/googleAuth');
const { router: webhookRoutes, notifierWebhooks } = require('./routes/webhooks');
const seoRoutes = require('./routes/seo');
const subscriptionRoutes = require('./routes/subscription');
const { router: emailRoutes, envoyerNotification } = require('./routes/emailNotif');
const aiArticleRoutes = require('./routes/aiArticle');

// Backup (Niveau 9)
const { backupDatabase } = require('./scripts/backup');

// Utilisation des routes
app.use('/api/articles', articleRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/saas', saasRoutes);
app.use('/api/notifications', notificationRoutes);

// Nouvelles routes
app.use('/api/auth/google', googleAuthRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/ai', aiArticleRoutes);

// Page d'accueil
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Middleware pour notifier les webhooks lors de la création d'article (à intégrer dans articleController)
// À ajouter dans articleController.js après la création d'article

// Gestionnaire d'erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Une erreur est survenue !' });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
  console.log(`📝 Interface: http://localhost:${port}`);
  console.log(`🤖 Chatbot disponible`);
  console.log(`🔐 Google Auth disponible`);
  console.log(`📧 Email notifications disponible`);
  console.log(`💰 Abonnements premium disponible`);
  console.log(`🤖 IA génération d'articles disponible`);
  console.log(`📁 Backup actif`);
});
