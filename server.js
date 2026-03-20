const express = require('express');
const app = express();
const port = 3000;

//Connexion a la base de donnees 
const db =require(`./database/db`);

// Middleware pour parser le JSON
app.use(express.json());

//Service les fichiers statiques (frond-end)
app.use(express.static(`public`));

// Importer les router 
const articleRoutes=require(`./routes/articleRoutes`);
app.use(`/api/articles`,articleRoutes);

// Route de test
app.get('/', (req, res) => {
  res.sendFile(_dirname + `/public/index.html`);
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
  console.log(`Interface web :http://localhost:${port}`);
  console.log(`API :http://localhost:${port}/api/articles`);
  console.log(`Appuie sur Ctrl+C pour arreter`);
});
