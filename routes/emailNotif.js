const express = require('express');
const router = express.Router();
const db = require('../database/db');
const nodemailer = require('nodemailer');

// Configuration email (à remplacer par tes identifiants)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'tonemail@gmail.com',
    pass: process.env.EMAIL_PASS || 'tonmotdepasse'
  }
});

// Envoyer un email
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: 'Blog Manager Pro <noreply@blogpro.com>',
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return false;
  }
};

// Envoyer notification aux abonnés
const envoyerNotification = async (article) => {
  db.all(`SELECT email FROM newsletter`, [], (err, abonnes) => {
    if (err || !abonnes) return;
    
    abonnes.forEach(abonne => {
      sendEmail(abonne.email, 
        `📝 Nouvel article : ${article.titre}`,
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h1 style="color: #667eea;">📝 ${article.titre}</h1>
          <p style="color: #666;">Par ${article.auteur} | ${article.date}</p>
          <div style="margin: 20px 0;">${article.contenu.substring(0, 300)}...</div>
          <a href="https://blogpro.com/article/${article.id}" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Lire la suite</a>
          <hr style="margin: 20px 0;">
          <p style="color: #888; font-size: 12px;">Blog Manager Pro - Gérez votre blog facilement</p>
        </div>`
      );
    });
  });
};

// Envoyer email de bienvenue
router.post('/welcome', async (req, res) => {
  const { email, nom } = req.body;
  const sent = await sendEmail(email,
    'Bienvenue sur Blog Manager Pro !',
    `<h1>Bienvenue ${nom} !</h1>
     <p>Merci de vous être inscrit sur Blog Manager Pro.</p>
     <p>Vous pouvez maintenant :</p>
     <ul>
       <li>📝 Créer vos premiers articles</li>
       <li>💬 Commenter les articles</li>
       <li>📧 Vous abonner à la newsletter</li>
     </ul>
     <a href="https://blogpro.com">Commencer maintenant</a>`
  );
  res.json({ sent });
});

// Tester l'envoi d'email
router.post('/test', async (req, res) => {
  const { to } = req.body;
  const sent = await sendEmail(to, 'Test Blog Manager Pro', '<h1>Test réussi !</h1><p>Votre serveur d\'emails fonctionne correctement.</p>');
  res.json({ sent });
});

module.exports = { router, envoyerNotification };
