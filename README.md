# 🚀 INF222 - BLOG API

API RESTful pour la gestion d'articles de blog.  
Développée dans le cadre du TAF1 du cours INF222.

---

## 🛠️ Technologies utilisées

- **Node.js**
- **Express**
- **SQLite**
- **JavaScript**

---

## ⚙️ Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/tchambahilaire/inf222-blog-api.git

# 2. Accéder au dossier
cd inf222-blog-api

# 3. Installer les dépendances
npm install

# 4. Lancer le serveur
npm run dev
```

📍 Accéder à l'application :  
👉 http://localhost:3000

---

## 📡 Endpoints de l'API

| Méthode | URL                          | Description                |
|--------|------------------------------|----------------------------|
| POST   | /api/articles                | Créer un article           |
| GET    | /api/articles                | Lister tous les articles   |
| GET    | /api/articles/:id            | Voir un article spécifique |
| PUT    | /api/articles/:id            | Modifier un article        |
| DELETE | /api/articles/:id            | Supprimer un article       |
| GET    | /api/articles/search?query=  | Rechercher des articles    |
| GET    | /api/articles/test           | Route de test              |

---

## 🧪 Exemples d'utilisation

### ➕ Créer un article
```bash
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -d '{"titre":"Mon article","contenu":"Contenu","auteur":"Moi"}'
```

### 📄 Lister tous les articles
```bash
curl http://localhost:3000/api/articles
```

### 🔍 Voir un article
```bash
curl http://localhost:3000/api/articles/1
```

### ✏️ Modifier un article
```bash
curl -X PUT http://localhost:3000/api/articles/1 \
  -H "Content-Type: application/json" \
  -d '{"titre":"Nouveau titre"}'
```

### ❌ Supprimer un article
```bash
curl -X DELETE http://localhost:3000/api/articles/1
```

### 🔎 Rechercher un article
```bash
curl "http://localhost:3000/api/articles/search?query=nodejs"
```

---

## 🗂️ Structure du projet

```bash
blog-backend/
├── server.js
├── package.json
├── database/
│   └── db.js
├── models/
│   └── articleModel.js
├── controllers/
│   └── articleController.js
├── routes/
│   └── articleRoutes.js
├── public/
│   └── index.html
└── docs/
    └── swagger.js
```

---

## 👨‍💻 Auteur

- **Nom** :Tchamba hilaire
- **Matricule** : 24G2644
- **Filière** : Informatique
- **UE** : INF222  

---

## 📅 Date

**Mars 2026**

