import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAll = async (req: Request, res: Response) => {
    try {
        const truies = await prisma.truie.findMany();
        res.json(truies);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching truies' });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        // Basic validation can be added here or via middleware (Zod)
        // For now we trust the types from frontend/schema but should be safer
        const newTruie = await prisma.truie.create({
            data: {
                identification: data.identification,
                dateEntree: new Date(data.dateEntree),
                dateNaissance: new Date(data.dateNaissance),
                poids: data.poids,
                statut: data.statut,
                notes: data.notes || "",
            },
        });
        res.status(201).json(newTruie);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating truie' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedTruie = await prisma.truie.update({
            where: { id },
            data: {
                ...data,
                dateEntree: data.dateEntree ? new Date(data.dateEntree) : undefined,
                dateNaissance: data.dateNaissance ? new Date(data.dateNaissance) : undefined,
            },
        });
        res.json(updatedTruie);
    } catch (error) {
        res.status(500).json({ error: 'Error updating truie' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.truie.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting truie' });
    }
};
