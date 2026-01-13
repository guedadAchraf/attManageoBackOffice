import express from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

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

// Télécharger un fichier Excel
router.get('/:id/download', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const excelFile = await prisma.excelFile.findUnique({
      where: { id: parseInt(id) }
    });

    if (!excelFile) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    if (excelFile.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Vous ne pouvez télécharger que vos propres fichiers' });
    }

    const filePath = path.join(process.cwd(), excelFile.filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fichier physique non trouvé' });
    }

    res.download(filePath, excelFile.fileName);
  } catch (error) {
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

    // Supprimer le fichier physique
    const filePath = path.join(process.cwd(), excelFile.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Supprimer l'enregistrement en base
    await prisma.excelFile.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Fichier supprimé avec succès' });
  } catch (error) {
    next(error);
  }
});

export default router;