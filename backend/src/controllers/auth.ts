import { Request, Response } from 'express';
import prisma from '../prisma';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, pin, name } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        const user = await prisma.user.create({
            data: { email, pin, name }
        });

        res.status(201).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, pin } = req.body;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || user.pin !== pin) {
            return res.status(401).json({ error: 'Email ou code PIN incorrect' });
        }

        res.json(user);
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

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
    }
};
