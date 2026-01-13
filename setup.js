#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configuration de ATT Forms...\n');

// Fonction pour exécuter des commandes
function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`📦 Exécution: ${command}`);
    execSync(command, { cwd, stdio: 'inherit' });
    console.log('✅ Terminé\n');
  } catch (error) {
    console.error(`❌ Erreur lors de l'exécution de: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Vérifier si Node.js est installé
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' });
  console.log(`✅ Node.js détecté: ${nodeVersion.trim()}`);
} catch (error) {
  console.error('❌ Node.js n\'est pas installé. Veuillez l\'installer depuis https://nodejs.org/');
  process.exit(1);
}

// Installer les dépendances du projet principal
console.log('📦 Installation des dépendances du projet principal...');
runCommand('npm install');

// Installer les dépendances du backend
console.log('📦 Installation des dépendances du backend...');
runCommand('npm install', path.join(process.cwd(), 'backend'));

// Installer les dépendances du frontend
console.log('📦 Installation des dépendances du frontend...');
runCommand('npm install', path.join(process.cwd(), 'frontend'));

// Générer le client Prisma
console.log('🗄️ Génération du client Prisma...');
runCommand('npx prisma generate', path.join(process.cwd(), 'backend'));

// Vérifier si le fichier .env existe
const envPath = path.join(process.cwd(), 'backend', '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  Le fichier .env n\'existe pas dans le backend.');
  console.log('📝 Veuillez copier .env.example vers .env et configurer vos variables d\'environnement.');
} else {
  console.log('✅ Fichier .env détecté dans le backend.');
}

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(process.cwd(), 'backend', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Dossier uploads créé.');
}

console.log('🎉 Configuration terminée avec succès !');
console.log('\n📋 Prochaines étapes:');
console.log('1. Configurez votre base de données dans backend/.env');
console.log('2. Exécutez les migrations: cd backend && npm run db:migrate');
console.log('3. Démarrez l\'application: npm run dev');
console.log('\n🌐 L\'application sera accessible sur:');
console.log('   - Frontend: http://localhost:3000');
console.log('   - Backend:  http://localhost:3001');
console.log('   - API Health: http://localhost:3001/api/health');