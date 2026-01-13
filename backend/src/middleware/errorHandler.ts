import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error.code === 'P2002') {
    return res.status(400).json({
      error: 'Cette ressource existe déjà',
      details: error.meta?.target
    });
  }

  if (error.code === 'P2025') {
    return res.status(404).json({
      error: 'Ressource non trouvée'
    });
  }

  res.status(500).json({
    error: 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
};