const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    console.log('🔄 Réinitialisation du mot de passe admin...');
    
    const adminEmail = 'admin@att-forms.com';
    const newPassword = 'admin123';
    
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { password: hashedPassword },
      create: {
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    
    console.log('✅ Mot de passe admin réinitialisé avec succès !');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Nouveau mot de passe: ${newPassword}`);
    console.log(`👤 Rôle: ${admin.role}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();