import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Valider que l'ID est un CUID valide
const cuidSchema = z.string().regex(/^c[a-z0-9]{24}$/, 'Invalid ID format');

export const validateIdParam = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    try {
        cuidSchema.parse(id);
        next();
    } catch (error) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
};
