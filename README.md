# ATT Forms - Application de Gestion de Formulaires Dynamiques

Une application web full-stack permettant de créer, gérer et soumettre des formulaires dynamiques avec génération automatique de fichiers Excel.

## 🚀 Fonctionnalités

### 🔐 Authentification & Rôles
- **JWT Authentication** entre React et Express
- **Deux types d'utilisateurs** :
  - **ADMIN** : Peut créer, modifier et supprimer des utilisateurs
  - **USER** : Peut créer et gérer ses propres formulaires

### 🧩 Création de Formulaires Dynamiques
- Interface intuitive pour créer des formulaires personnalisés
- **Types de champs supportés** :
  - Champ texte simple (`input type="text"`)
  - Zone de texte (`textarea`)
- **Fonctionnalités** :
  - Ajout/suppression de champs dynamique
  - Configuration des labels
  - Champs obligatoires/optionnels
  - Réorganisation des champs

### 💾 Gestion des Données
- **Base de données PostgreSQL** (Neon) pour stocker :
  - Formulaires et leurs champs
  - Soumissions des utilisateurs
  - Métadonnées des fichiers Excel
- **Validation** des données côté client et serveur

### 📊 Génération de Fichiers Excel
- **Génération automatique** de fichiers Excel (.xlsx) lors de chaque soumission
- **Contenu des fichiers** :
  - Métadonnées du formulaire
  - Données saisies par l'utilisateur
  - Informations de soumission (date, utilisateur)
- **Gestion des fichiers** :
  - Stockage sécurisé sur le serveur
  - Interface de téléchargement
  - Historique des fichiers générés

## 🛠️ Technologies Utilisées

### Backend
- **Express.js** avec TypeScript
- **Prisma ORM** pour la base de données
- **PostgreSQL** (Neon) comme base de données
- **JWT** pour l'authentification
- **ExcelJS** pour la génération de fichiers Excel
- **bcryptjs** pour le hachage des mots de passe

### Frontend
- **React 18** avec TypeScript
- **Vite** comme bundler
- **React Router** pour la navigation
- **React Hook Form** pour la gestion des formulaires
- **Tailwind CSS** pour le styling
- **Axios** pour les requêtes HTTP
- **React Hot Toast** pour les notifications

## 📦 Installation

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn
- Compte Neon (PostgreSQL cloud)

### 1. Cloner le projet
```bash
git clone <url-du-repo>
cd att-forms
```

### 2. Installation des dépendances
```bash
# Installer les dépendances du projet principal
npm install

# Installer toutes les dépendances (backend + frontend)
npm run install:all
```

### 3. Configuration de la base de données

#### Backend
```bash
cd backend
cp .env.example .env
```

Modifiez le fichier `.env` avec vos informations :
```env
DATABASE_URL="postgresql://neondb_owner:npg_dRteKqDZ9k8u@ep-green-queen-agb1x5ja-pooler.c-2.eu-central-1.aws.neon.tech/att_forms?sslmode=require&channel_binding=require"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3001
NODE_ENV=development
UPLOAD_DIR=uploads
```

#### Initialisation de la base de données
```bash
# Générer le client Prisma
npm run db:generate

# Appliquer les migrations
npm run db:migrate
```

### 4. Démarrage de l'application

#### Option 1 : Démarrage simultané (recommandé)
```bash
# Depuis la racine du projet
npm run dev
```

#### Option 2 : Démarrage séparé
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

L'application sera accessible à :
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:3001
- **Health Check** : http://localhost:3001/api/health

## 📱 Utilisation

### 1. Inscription/Connexion
- Créez un compte utilisateur via la page d'inscription
- Connectez-vous avec vos identifiants

### 2. Création d'un Formulaire
1. Cliquez sur "Créer un formulaire"
2. Donnez un nom à votre formulaire
3. Ajoutez des champs :
   - Choisissez le type (texte ou textarea)
   - Définissez le label
   - Marquez comme obligatoire si nécessaire
4. Sauvegardez le formulaire

### 3. Soumission de Formulaire
1. Accédez à un formulaire depuis la liste
2. Remplissez les champs
3. Soumettez le formulaire
4. Un fichier Excel est automatiquement généré

### 4. Gestion des Fichiers Excel
- Consultez la liste de vos fichiers Excel
- Téléchargez les fichiers générés
- Supprimez les fichiers non nécessaires

### 5. Administration (ADMIN uniquement)
- Gérez les utilisateurs (création, modification, suppression)
- Consultez les statistiques globales

## 🗂️ Structure du Projet

```
att-forms/
├── backend/                 # API Express.js
│   ├── src/
│   │   ├── routes/         # Routes API
│   │   ├── middleware/     # Middlewares (auth, errors)
│   │   ├── services/       # Services (Excel generation)
│   │   └── lib/           # Utilitaires (Prisma client)
│   ├── prisma/            # Schéma et migrations
│   └── uploads/           # Fichiers Excel générés
├── frontend/              # Application React
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/         # Pages de l'application
│   │   ├── contexts/      # Contextes React (Auth)
│   │   └── services/      # Services API
└── shared/                # Types TypeScript partagés
```

## 🔧 Scripts Disponibles

### Projet principal
- `npm run dev` : Démarre backend et frontend simultanément
- `npm run install:all` : Installe toutes les dépendances

### Backend
- `npm run dev` : Démarre le serveur en mode développement
- `npm run build` : Compile le TypeScript
- `npm run start` : Démarre le serveur en production
- `npm run db:migrate` : Applique les migrations Prisma
- `npm run db:generate` : Génère le client Prisma
- `npm run db:studio` : Ouvre Prisma Studio

### Frontend
- `npm run dev` : Démarre le serveur de développement Vite
- `npm run build` : Compile l'application pour la production
- `npm run preview` : Prévisualise la build de production

## 🔒 Sécurité

- **Authentification JWT** avec expiration
- **Hachage des mots de passe** avec bcryptjs
- **Validation des données** côté client et serveur
- **Protection CORS** configurée
- **Helmet.js** pour les en-têtes de sécurité
- **Autorisation basée sur les rôles**

## 🚀 Déploiement

### Backend
1. Configurez les variables d'environnement de production
2. Compilez le TypeScript : `npm run build`
3. Déployez sur votre plateforme (Heroku, Railway, etc.)

### Frontend
1. Configurez l'URL de l'API de production
2. Compilez l'application : `npm run build`
3. Déployez le dossier `dist` (Netlify, Vercel, etc.)

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
1. Consultez la documentation
2. Vérifiez les issues existantes
3. Créez une nouvelle issue si nécessaire

---

**Développé avec ❤️ pour ATT Forms**