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
