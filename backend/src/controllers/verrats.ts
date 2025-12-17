import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAll = async (req: Request, res: Response) => {
    try {
        const verrats = await prisma.verrat.findMany();
        res.json(verrats);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching verrats' });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const newVerrat = await prisma.verrat.create({
            data: {
                identification: data.identification,
                dateEntree: new Date(data.dateEntree),
                dateNaissance: new Date(data.dateNaissance),
                poids: data.poids,
                statut: data.statut,
            },
        });
        res.status(201).json(newVerrat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating verrat' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedVerrat = await prisma.verrat.update({
            where: { id },
            data: {
                ...data,
                dateEntree: data.dateEntree ? new Date(data.dateEntree) : undefined,
                dateNaissance: data.dateNaissance ? new Date(data.dateNaissance) : undefined,
            },
        });
        res.json(updatedVerrat);
    } catch (error) {
        res.status(500).json({ error: 'Error updating verrat' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.verrat.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting verrat' });
    }
};
