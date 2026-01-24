import { Request, Response } from 'express';
import prisma from '../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
    const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_super_secure';
    try {
        const { email, pin, name } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        // Hachage du code PIN
        const hashedPin = await bcrypt.hash(pin, 10);

        const user = await prisma.user.create({
            data: { 
                email, 
                pin: hashedPin, 
                name 
            }
        });

        // Ne pas renvoyer le PIN
        const { pin: _, ...userWithoutPin } = user;
        
        // Générer un token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ user: userWithoutPin, token });
    } catch (error: any) {
        console.error('Registration Error Details:', error);
        res.status(500).json({ 
            error: 'Erreur lors de l\'inscription',
            details: error.message || 'Unknown error'
        });
    }
};

export const login = async (req: Request, res: Response) => {
    const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_super_secure';
    try {
        const { email, pin } = req.body;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ error: 'Email ou code PIN incorrect' });
        }

        // Comparer le PIN haché
        const isPinValid = await bcrypt.compare(pin, user.pin);
        if (!isPinValid) {
            return res.status(401).json({ error: 'Email ou code PIN incorrect' });
        }

        // Générer un token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        const { pin: _, ...userWithoutPin } = user;
        res.json({ user: userWithoutPin, token });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: 'Email requis' });
        }

        const user = await prisma.user.findUnique({
            where: { email: String(email) }
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
