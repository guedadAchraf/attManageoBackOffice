# 🚀 Démarrage Rapide - ATT Forms

## Installation Express (5 minutes)

### 1. Cloner et installer
```bash
git clone <url-du-repo>
cd att-forms
npm run setup
```

### 2. Configurer la base de données
Le fichier `backend/.env` est déjà configuré avec votre URL Neon PostgreSQL.

### 3. Initialiser la base de données
```bash
cd backend
npm run db:migrate
npm run db:seed
```

### 4. Démarrer l'application
```bash
# Depuis la racine du projet
npm run dev
```

## 🎯 Accès à l'application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:3001
- **Health Check** : http://localhost:3001/api/health

## 👤 Comptes de test

### Administrateur
- **Email** : admin@att-forms.com
- **Mot de passe** : admin123
- **Permissions** : Gestion des utilisateurs + formulaires

### Utilisateur
- **Email** : user@att-forms.com
- **Mot de passe** : user123
- **Permissions** : Création et gestion de formulaires

## 📋 Test rapide

### 1. Connexion
1. Allez sur http://localhost:3000
2. Connectez-vous avec un des comptes ci-dessus

### 2. Créer un formulaire
1. Cliquez sur "Créer un formulaire"
2. Donnez un nom : "Test Contact"
3. Ajoutez des champs :
   - Nom (texte, obligatoire)
   - Email (texte, obligatoire)  
   - Message (textarea, optionnel)
4. Sauvegardez

### 3. Soumettre le formulaire
1. Accédez au formulaire créé
2. Remplissez les champs
3. Soumettez
4. Un fichier Excel est automatiquement généré

### 4. Télécharger le fichier Excel
1. Allez dans "Fichiers Excel"
2. Téléchargez le fichier généré
3. Ouvrez-le pour voir les données

## 🛠️ Commandes utiles

```bash
# Démarrer seulement le backend
cd backend && npm run dev

# Démarrer seulement le frontend  
cd frontend && npm run dev

# Voir la base de données (Prisma Studio)
cd backend && npm run db:studio

# Réinitialiser la base de données
cd backend && npm run db:migrate -- --reset

# Voir les logs du serveur
# Les logs apparaissent dans le terminal où vous avez lancé npm run dev
```

## 🔧 Résolution de problèmes

### Port déjà utilisé
```bash
# Tuer le processus sur le port 3000
npx kill-port 3000

# Tuer le processus sur le port 3001
npx kill-port 3001
```

### Erreur de base de données
```bash
cd backend
npm run db:generate
npm run db:migrate
```

### Dépendances manquantes
```bash
npm run install:all
```

### Fichier .env manquant
```bash
cd backend
cp .env.example .env
# Puis éditez .env avec vos paramètres
```

## 📱 Fonctionnalités à tester

### ✅ Authentification
- [x] Inscription
- [x] Connexion
- [x] Déconnexion
- [x] Gestion des rôles (ADMIN/USER)

### ✅ Formulaires
- [x] Création de formulaires dynamiques
- [x] Ajout/suppression de champs
- [x] Types de champs (text/textarea)
- [x] Champs obligatoires
- [x] Modification de formulaires
- [x] Suppression de formulaires

### ✅ Soumissions
- [x] Remplissage de formulaires
- [x] Validation des champs obligatoires
- [x] Génération automatique d'Excel
- [x] Historique des soumissions

### ✅ Fichiers Excel
- [x] Génération automatique
- [x] Téléchargement
- [x] Suppression
- [x] Métadonnées complètes

### ✅ Administration (ADMIN)
- [x] Gestion des utilisateurs
- [x] Création d'utilisateurs
- [x] Modification d'utilisateurs
- [x] Suppression d'utilisateurs

## 🎉 Prêt à utiliser !

Votre application ATT Forms est maintenant opérationnelle. Vous pouvez :

1. **Créer des formulaires** personnalisés avec différents types de champs
2. **Collecter des données** via les soumissions
3. **Générer automatiquement des fichiers Excel** avec les données
4. **Gérer les utilisateurs** (si vous êtes admin)
5. **Télécharger et consulter** tous vos fichiers Excel

Pour plus de détails, consultez le `README.md` complet et la `API_DOCUMENTATION.md`.