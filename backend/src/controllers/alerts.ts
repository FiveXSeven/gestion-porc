import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAll = async (req: Request, res: Response) => {
    try {
        const alerts = await prisma.alert.findMany();
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching alerts' });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const newAlert = await prisma.alert.create({
            data: {
                type: data.type,
                message: data.message,
                date: new Date(data.date),
                read: data.read || false,
                relatedId: data.relatedId,
            },
        });
        res.status(201).json(newAlert);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating alert' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedAlert = await prisma.alert.update({
            where: { id },
            data: {
                ...data,
                date: data.date ? new Date(data.date) : undefined,
            },
        });
        res.json(updatedAlert);
    } catch (error) {
        res.status(500).json({ error: 'Error updating alert' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.alert.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting alert' });
    }
};
