import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAll = async (req: Request, res: Response) => {
    try {
        const portees = await prisma.portee.findMany({
            include: {
                miseBas: true,
                truie: true
            }
        });
        res.json(portees);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching portees' });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const newPortee = await prisma.portee.create({
            data: {
                miseBasId: data.miseBasId,
                truieId: data.truieId,
                nombreActuel: data.nombreActuel,
                dateSevrage: data.dateSevrage ? new Date(data.dateSevrage) : null,
                poidsSevrage: data.poidsSevrage,
                statut: data.statut,
            },
        });
        res.status(201).json(newPortee);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating portee' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedPortee = await prisma.portee.update({
            where: { id },
            data: {
                ...data,
                dateSevrage: data.dateSevrage ? new Date(data.dateSevrage) : undefined,
            },
        });
        res.json(updatedPortee);
    } catch (error) {
        res.status(500).json({ error: 'Error updating portee' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.portee.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting portee' });
    }
};
