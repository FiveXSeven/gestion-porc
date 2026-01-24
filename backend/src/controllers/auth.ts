import { Request, Response } from 'express';
import prisma from '../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getOrGenerateJWTSecret } from '../utils/jwt-secret';
import { z } from 'zod';

const JWT_SECRET = getOrGenerateJWTSecret();

// Schémas de validation
const registerSchema = z.object({
    email: z.string().email('Email invalide'),
    pin: z.string().min(4, 'PIN doit avoir au moins 4 caractères'),
    name: z.string().min(2, 'Nom doit avoir au moins 2 caractères')
});

const loginSchema = z.object({
    email: z.string().email('Email invalide'),
    pin: z.string().min(4, 'PIN invalide')
});

export const register = async (req: Request, res: Response) => {
    try {
        const data = registerSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        const hashedPin = await bcrypt.hash(data.pin, 10);

        const user = await prisma.user.create({
            data: { 
                email: data.email, 
                pin: hashedPin, 
                name: data.name
            }
        });

        const { pin: _, ...userWithoutPin } = user;
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ user: userWithoutPin, token });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Registration Error:', error.message);
        res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const data = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (!user) {
            return res.status(401).json({ error: 'Email ou code PIN incorrect' });
        }

        const isPinValid = await bcrypt.compare(data.pin, user.pin);
        if (!isPinValid) {
            return res.status(401).json({ error: 'Email ou code PIN incorrect' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        const { pin: _, ...userWithoutPin } = user;
        res.json({ user: userWithoutPin, token });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        
        if (!userId) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const { pin: _, ...userWithoutPin } = user;
        res.json(userWithoutPin);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
    }
};
