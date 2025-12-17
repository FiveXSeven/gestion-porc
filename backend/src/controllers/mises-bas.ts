import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAll = async (req: Request, res: Response) => {
    try {
        const misesBas = await prisma.miseBas.findMany({
            include: {
                truie: true,
                saillie: true
            }
        });
        res.json(misesBas);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching mises bas' });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const newMiseBas = await prisma.miseBas.create({
            data: {
                saillieId: data.saillieId,
                truieId: data.truieId,
                date: new Date(data.date),
                nesVivants: data.nesVivants,
                mortNes: data.mortNes,
                poidsMoyen: data.poidsMoyen,
                notes: data.notes || "",
            },
        });
        res.status(201).json(newMiseBas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating mise bas' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedMiseBas = await prisma.miseBas.update({
            where: { id },
            data: {
                ...data,
                date: data.date ? new Date(data.date) : undefined,
            },
        });
        res.json(updatedMiseBas);
    } catch (error) {
        res.status(500).json({ error: 'Error updating mise bas' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.miseBas.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting mise bas' });
    }
};
