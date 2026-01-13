import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { CreateFormRequest } from '../../../shared/types';
import { generateOrUpdateExcelFile } from '../services/excelService.vercel';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Lister les formulaires de l'utilisateur connecté
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const forms = await prisma.form.findMany({
      where: { creatorId: req.user!.id },
      include: {
        fields: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(forms);
  } catch (error) {
    next(error);
  }
});

// Récupérer un formulaire spécifique
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    
    const form = await prisma.form.findUnique({
      where: { id: parseInt(id) },
      include: {
        fields: {
          orderBy: { order: 'asc' }
        },
        creator: {
          select: { id: true, email: true }
        }
      }
    });

    if (!form) {
      return res.status(404).json({ error: 'Formulaire non trouvé' });
    }

    res.json(form);
  } catch (error) {
    next(error);
  }
});

// Créer un nouveau formulaire
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { name, fields }: CreateFormRequest = req.body;

    if (!name || !fields || fields.length === 0) {
      return res.status(400).json({ error: 'Nom et champs du formulaire requis' });
    }

    const form = await prisma.form.create({
      data: {
        name,
        creatorId: req.user!.id,
        fields: {
          create: fields.map((field, index) => ({
            type: field.type,
            label: field.label,
            order: field.order || index,
            required: field.required || false
          }))
        }
      },
      include: {
        fields: {
          orderBy: { order: 'asc' }
        }
      }
    });

    res.status(201).json(form);
  } catch (error) {
    next(error);
  }
});

// Modifier un formulaire
router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { name, fields }: CreateFormRequest = req.body;

    // Vérifier que l'utilisateur est le créateur du formulaire
    const existingForm = await prisma.form.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingForm) {
      return res.status(404).json({ error: 'Formulaire non trouvé' });
    }

    if (existingForm.creatorId !== req.user!.id) {
      return res.status(403).json({ error: 'Vous ne pouvez modifier que vos propres formulaires' });
    }

    // Supprimer les anciens champs et créer les nouveaux
    await prisma.formField.deleteMany({
      where: { formId: parseInt(id) }
    });

    const form = await prisma.form.update({
      where: { id: parseInt(id) },
      data: {
        name,
        fields: {
          create: fields.map((field, index) => ({
            type: field.type,
            label: field.label,
            order: field.order || index,
            required: field.required || false
          }))
        }
      },
      include: {
        fields: {
          orderBy: { order: 'asc' }
        }
      }
    });

    res.json(form);
  } catch (error) {
    next(error);
  }
});

// Supprimer un formulaire
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const form = await prisma.form.findUnique({
      where: { id: parseInt(id) }
    });

    if (!form) {
      return res.status(404).json({ error: 'Formulaire non trouvé' });
    }

    if (form.creatorId !== req.user!.id) {
      return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres formulaires' });
    }

    await prisma.form.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Formulaire supprimé avec succès' });
  } catch (error) {
    next(error);
  }
});

// Soumettre un formulaire (SANS génération Excel)
router.post('/:id/submit', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { data }: { data: Record<string, string> } = req.body;

    const form = await prisma.form.findUnique({
      where: { id: parseInt(id) },
      include: {
        fields: true
      }
    });

    if (!form) {
      return res.status(404).json({ error: 'Formulaire non trouvé' });
    }

    // Valider les données
    for (const field of form.fields) {
      if (field.required && (!data[field.id.toString()] || data[field.id.toString()].trim() === '')) {
        return res.status(400).json({ error: `Le champ "${field.label}" est requis` });
      }
    }

    // Créer la soumission SANS générer l'Excel
    const submission = await prisma.formSubmission.create({
      data: {
        formId: parseInt(id),
        submitterId: req.user!.id,
        data
      }
    });

    res.status(201).json({
      submission,
      message: 'Données sauvegardées avec succès'
    });
  } catch (error) {
    next(error);
  }
});

// Nouvelle route pour générer l'Excel avec les soumissions récentes
router.post('/:id/generate-excel', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { submissionIds } = req.body; // IDs des soumissions à inclure dans l'Excel

    console.log('🔄 Génération Excel demandée pour formulaire:', id);
    console.log('📊 IDs des soumissions:', submissionIds);

    const form = await prisma.form.findUnique({
      where: { id: parseInt(id) },
      include: {
        fields: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!form) {
      return res.status(404).json({ error: 'Formulaire non trouvé' });
    }

    let submissions;
    
    if (submissionIds && submissionIds.length > 0) {
      // Récupérer seulement les soumissions spécifiées
      console.log('📋 Récupération des soumissions spécifiées');
      submissions = await prisma.formSubmission.findMany({
        where: {
          id: { in: submissionIds },
          submitterId: req.user!.id,
          formId: parseInt(id)
        },
        orderBy: { createdAt: 'asc' }
      });
    } else {
      // Récupérer les soumissions récentes de l'utilisateur (dernières 24h par exemple)
      console.log('📋 Récupération des soumissions récentes');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      submissions = await prisma.formSubmission.findMany({
        where: {
          formId: parseInt(id),
          submitterId: req.user!.id,
          createdAt: { gte: yesterday }
        },
        orderBy: { createdAt: 'asc' }
      });
    }

    console.log('📊 Soumissions trouvées:', submissions.length);

    if (submissions.length === 0) {
      return res.status(400).json({ error: 'Aucune donnée récente à exporter' });
    }

    // Générer ou mettre à jour le fichier Excel avec les soumissions sélectionnées
    const userForExcel = {
      id: req.user!.id,
      email: req.user!.email,
      role: req.user!.role,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('🔄 Appel du service Excel...');
    const result = await generateOrUpdateExcelFile(form, submissions, userForExcel);
    console.log('✅ Service Excel terminé avec succès');

    res.status(201).json({
      excelFile: result.excelFile,
      message: result.isNewVersion 
        ? `Fichier Excel mis à jour (v${result.excelFile.version}) avec ${result.newEntriesCount} nouvelle(s) entrée(s)`
        : `Fichier Excel créé avec ${result.newEntriesCount} entrée(s)`,
      submissionsCount: result.totalEntriesCount,
      newEntriesCount: result.newEntriesCount,
      version: result.excelFile.version,
      isNewVersion: result.isNewVersion
    });
  } catch (error) {
    console.error('❌ Erreur lors de la génération Excel:', error);
    next(error);
  }
});

// Lister les soumissions d'un formulaire
router.get('/:id/submissions', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const form = await prisma.form.findUnique({
      where: { id: parseInt(id) }
    });

    if (!form) {
      return res.status(404).json({ error: 'Formulaire non trouvé' });
    }

    if (form.creatorId !== req.user!.id) {
      return res.status(403).json({ error: 'Vous ne pouvez voir que les soumissions de vos propres formulaires' });
    }

    const submissions = await prisma.formSubmission.findMany({
      where: { formId: parseInt(id) },
      include: {
        submitter: {
          select: { id: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(submissions);
  } catch (error) {
    next(error);
  }
});

export default router;