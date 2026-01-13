# Documentation API - ATT Forms

## Base URL
```
http://localhost:3001/api
```

## Authentification
Toutes les routes protégées nécessitent un token JWT dans l'en-tête Authorization :
```
Authorization: Bearer <token>
```

## Endpoints

### 🔐 Authentification

#### POST /auth/register
Inscription d'un nouvel utilisateur
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /auth/login
Connexion utilisateur
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### GET /auth/me
Récupérer les informations de l'utilisateur connecté
- Nécessite authentification

### 👥 Utilisateurs (ADMIN uniquement)

#### GET /users
Lister tous les utilisateurs
- Nécessite authentification ADMIN

#### POST /users
Créer un nouvel utilisateur
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "role": "USER" | "ADMIN"
}
```

#### PUT /users/:id
Modifier un utilisateur
```json
{
  "email": "updated@example.com",
  "password": "newpassword", // optionnel
  "role": "USER" | "ADMIN"
}
```

#### DELETE /users/:id
Supprimer un utilisateur

### 📝 Formulaires

#### GET /forms
Lister les formulaires de l'utilisateur connecté
- Nécessite authentification

#### GET /forms/:id
Récupérer un formulaire spécifique
- Nécessite authentification

#### POST /forms
Créer un nouveau formulaire
```json
{
  "name": "Mon formulaire",
  "fields": [
    {
      "type": "text" | "textarea",
      "label": "Nom du champ",
      "required": true,
      "order": 0
    }
  ]
}
```

#### PUT /forms/:id
Modifier un formulaire existant
```json
{
  "name": "Formulaire modifié",
  "fields": [
    {
      "type": "text" | "textarea",
      "label": "Champ modifié",
      "required": false,
      "order": 0
    }
  ]
}
```

#### DELETE /forms/:id
Supprimer un formulaire

#### POST /forms/:id/submit
Soumettre un formulaire
```json
{
  "data": {
    "1": "Valeur pour le champ ID 1",
    "2": "Valeur pour le champ ID 2"
  }
}
```

#### GET /forms/:id/submissions
Récupérer les soumissions d'un formulaire
- Nécessite authentification
- Seul le créateur du formulaire peut voir ses soumissions

### 📊 Fichiers Excel

#### GET /excel
Lister les fichiers Excel de l'utilisateur
- Nécessite authentification

#### GET /excel/:id/download
Télécharger un fichier Excel
- Nécessite authentification
- Seul le propriétaire peut télécharger

#### DELETE /excel/:id
Supprimer un fichier Excel
- Nécessite authentification
- Seul le propriétaire peut supprimer

### 🏥 Health Check

#### GET /health
Vérifier l'état du serveur
```json
{
  "status": "OK",
  "timestamp": "2024-01-12T10:00:00.000Z"
}
```

## Codes de Réponse

### Succès
- `200` - OK
- `201` - Créé avec succès

### Erreurs Client
- `400` - Requête invalide
- `401` - Non authentifié
- `403` - Accès interdit
- `404` - Ressource non trouvée

### Erreurs Serveur
- `500` - Erreur interne du serveur

## Exemples de Réponses

### Authentification réussie
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "USER",
    "createdAt": "2024-01-12T10:00:00.000Z",
    "updatedAt": "2024-01-12T10:00:00.000Z"
  }
}
```

### Formulaire avec champs
```json
{
  "id": 1,
  "name": "Formulaire de contact",
  "creatorId": 1,
  "createdAt": "2024-01-12T10:00:00.000Z",
  "updatedAt": "2024-01-12T10:00:00.000Z",
  "fields": [
    {
      "id": 1,
      "formId": 1,
      "type": "text",
      "label": "Nom complet",
      "order": 0,
      "required": true
    },
    {
      "id": 2,
      "formId": 1,
      "type": "textarea",
      "label": "Message",
      "order": 1,
      "required": false
    }
  ]
}
```

### Erreur de validation
```json
{
  "error": "Email et mot de passe requis"
}
```

### Erreur d'authentification
```json
{
  "error": "Token d'accès requis"
}
```

## Types de Données

### User
```typescript
interface User {
  id: number
  email: string
  role: 'ADMIN' | 'USER'
  createdAt: Date
  updatedAt: Date
}
```

### Form
```typescript
interface Form {
  id: number
  name: string
  creatorId: number
  createdAt: Date
  updatedAt: Date
  fields: FormField[]
}
```

### FormField
```typescript
interface FormField {
  id: number
  formId: number
  type: 'text' | 'textarea'
  label: string
  order: number
  required: boolean
}
```

### FormSubmission
```typescript
interface FormSubmission {
  id: number
  formId: number
  submitterId: number
  data: Record<string, string>
  createdAt: Date
}
```

### ExcelFile
```typescript
interface ExcelFile {
  id: number
  fileName: string
  filePath: string
  ownerId: number
  formSubmissionId: number
  createdAt: Date
}
```