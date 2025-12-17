import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAll = async (req: Request, res: Response) => {
    try {
        const lots = await prisma.lotPostSevrage.findMany({
            include: {
                portee: true
            }
        });
        res.json(lots);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching lots post-sevrage' });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const newLot = await prisma.lotPostSevrage.create({
            data: {
                identification: data.identification,
                dateCreation: new Date(data.dateCreation),
                origine: data.origine,
                porteeId: data.porteeId,
                nombreInitial: data.nombreInitial,
                nombreActuel: data.nombreActuel,
                poidsEntree: data.poidsEntree,
                dateEntree: new Date(data.dateEntree),
                poidsCible: data.poidsCible,
                statut: data.statut,
                notes: data.notes || "",
            },
        });
        res.status(201).json(newLot);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating lot post-sevrage' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedLot = await prisma.lotPostSevrage.update({
            where: { id },
            data: {
                ...data,
                dateCreation: data.dateCreation ? new Date(data.dateCreation) : undefined,
                dateEntree: data.dateEntree ? new Date(data.dateEntree) : undefined,
            },
        });
        res.json(updatedLot);
    } catch (error) {
        res.status(500).json({ error: 'Error updating lot post-sevrage' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.lotPostSevrage.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting lot post-sevrage' });
    }
};
