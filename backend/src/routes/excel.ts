import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { generateOrUpdateExcelFile } from '../services/excelService.vercel';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Lister les fichiers Excel de l'utilisateur
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const excelFiles = await prisma.excelFile.findMany({
      where: { ownerId: req.user!.id },
      include: {
        form: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(excelFiles);
  } catch (error) {
    next(error);
  }
});

// Télécharger un fichier Excel - REGENERATE ON DEMAND for Vercel
router.get('/:id/download', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const excelFile = await prisma.excelFile.findUnique({
      where: { id: parseInt(id) },
      include: {
        form: {
          include: {
            fields: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    if (!excelFile) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    if (excelFile.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Vous ne pouvez télécharger que vos propres fichiers' });
    }

    // For Vercel: Regenerate the Excel file on-demand
    console.log('🔄 Régénération Excel pour téléchargement...');
    
    // Get the submissions that were used for this Excel file
    const submissions = await prisma.formSubmission.findMany({
      where: {
        formId: excelFile.formId,
        submitterId: req.user!.id
      },
      orderBy: { createdAt: 'asc' },
      take: excelFile.submissionsCount // Limit to the number that was originally used
    });

    const userForExcel = {
      id: req.user!.id,
      email: req.user!.email,
      role: req.user!.role,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Regenerate the Excel file
    const result = await generateOrUpdateExcelFile(excelFile.form, submissions, userForExcel);

    // Send the buffer as a download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${excelFile.fileName}"`);
    res.setHeader('Content-Length', result.buffer.length);
    
    res.send(result.buffer);
  } catch (error) {
    console.error('❌ Erreur téléchargement Excel:', error);
    next(error);
  }
});

// Supprimer un fichier Excel
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const excelFile = await prisma.excelFile.findUnique({
      where: { id: parseInt(id) }
    });

    if (!excelFile) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    if (excelFile.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres fichiers' });
    }

    // For Vercel: Only delete the database record (no physical file to delete)
    await prisma.excelFile.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Fichier supprimé avec succès' });
  } catch (error) {
    next(error);
  }
});

export default router;