import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { CreateUserRequest } from '../../../shared/types';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Lister tous les utilisateurs (ADMIN seulement)
router.get('/', requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            createdForms: true,
            formSubmissions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Créer un utilisateur (ADMIN seulement)
router.post('/', requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { email, password, role }: CreateUserRequest = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, mot de passe et rôle requis' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// Modifier un utilisateur (ADMIN seulement)
router.put('/:id', requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { email, password, role } = req.body;

    const updateData: any = {};
    
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
      }
      updateData.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Supprimer un utilisateur (ADMIN seulement)
router.delete('/:id', requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // Empêcher la suppression de son propre compte
    if (req.user!.id === userId) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    next(error);
  }
});

export default router;