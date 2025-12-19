import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAll = async (req: Request, res: Response) => {
    try {
        const saillies = await prisma.saillie.findMany({
            include: {
                truie: true
            }
        });
        res.json(saillies);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching saillies' });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const newSaillie = await prisma.saillie.create({
            data: {
                truieId: data.truieId,
                date: new Date(data.date),
                methode: data.methode,
                employe: data.employe,
                datePrevueMiseBas: new Date(data.datePrevueMiseBas),
                statut: data.statut,
            },
        });
        res.status(201).json(newSaillie);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating saillie' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedSaillie = await prisma.saillie.update({
            where: { id },
            data: {
                ...data,
                date: data.date ? new Date(data.date) : undefined,
                datePrevueMiseBas: data.datePrevueMiseBas ? new Date(data.datePrevueMiseBas) : undefined,
            },
        });
        res.json(updatedSaillie);
    } catch (error) {
        res.status(500).json({ error: 'Error updating saillie' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.saillie.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting saillie' });
    }
};

export const confirm = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedSaillie = await prisma.saillie.update({
            where: { id },
            data: {
                statut: 'confirmee',
            },
        });
        
        // Also update truie status to gestante if not already
        await prisma.truie.update({
            where: { id: updatedSaillie.truieId },
            data: { statut: 'gestante' },
        });
        
        res.json(updatedSaillie);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error confirming saillie' });
    }
};

export const fail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const saillie = await prisma.saillie.findUnique({
            where: { id },
        });
        
        if (!saillie) {
            return res.status(404).json({ error: 'Saillie not found' });
        }
        
        const updatedSaillie = await prisma.saillie.update({
            where: { id },
            data: {
                statut: 'echouee',
            },
        });
        
        // Reset truie status back to active
        await prisma.truie.update({
            where: { id: saillie.truieId },
            data: { statut: 'active' },
        });
        
        res.json(updatedSaillie);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error marking saillie as failed' });
    }
};
