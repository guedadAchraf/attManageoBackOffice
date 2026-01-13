import express from 'express';
import { generateOrUpdateExcelFile } from '../services/excelService.minimal';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Test simple de génération Excel
router.get('/excel', async (req, res) => {
  try {
    console.log('🧪 Test de génération Excel...');

    // Données de test
    const testForm = {
      id: 1,
      name: 'Test Form',
      fields: [
        { id: 1, label: 'Nom', type: 'text' },
        { id: 2, label: 'Email', type: 'text' }
      ]
    };

    const testSubmissions = [
      {
        id: 1,
        data: {
          '1': 'John Doe',
          '2': 'john@example.com'
        }
      }
    ];

    const testUser = {
      id: 1,
      email: 'test@example.com',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('📊 Données de test préparées');

    const result = await generateOrUpdateExcelFile(testForm, testSubmissions, testUser);

    console.log('✅ Test réussi !');
    res.json({
      success: true,
      result,
      message: 'Test Excel réussi'
    });

  } catch (error: any) {
    console.error('❌ Test Excel échoué:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Test avec vraies données de la DB
router.get('/excel-real', async (req, res) => {
  try {
    console.log('🧪 Test Excel avec vraies données...');

    // Récupérer un vrai formulaire
    const form = await prisma.form.findFirst({
      include: {
        fields: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!form) {
      return res.status(404).json({
        success: false,
        error: 'Aucun formulaire trouvé en base'
      });
    }

    // Récupérer les soumissions
    const submissions = await prisma.formSubmission.findMany({
      where: { formId: form.id },
      take: 5 // Limiter à 5 pour le test
    });

    console.log('📊 Formulaire trouvé:', form.name);
    console.log('📊 Soumissions trouvées:', submissions.length);

    if (submissions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Aucune soumission trouvée'
      });
    }

    // Récupérer l'utilisateur propriétaire
    const user = await prisma.user.findUnique({
      where: { id: form.creatorId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    const userForExcel = {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    console.log('🔄 Génération Excel avec vraies données...');
    const result = await generateOrUpdateExcelFile(form, submissions, userForExcel);

    console.log('✅ Test avec vraies données réussi !');
    res.json({
      success: true,
      result,
      formName: form.name,
      submissionsCount: submissions.length,
      message: 'Test Excel avec vraies données réussi'
    });

  } catch (error: any) {
    console.error('❌ Test Excel avec vraies données échoué:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

export default router;