import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAll = async (req: Request, res: Response) => {
    try {
        const pesees = await prisma.pesee.findMany();
        // Transform backend structure to match frontend expectation (lotId)
        // If frontend expects 'lotId', we map whichever is present.
        const mappedPesees = pesees.map(p => ({
            ...p,
            lotId: p.lotEngraissementId || p.lotPostSevrageId
        }));
        res.json(mappedPesees);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching pesees' });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        // Determine whether lotId belongs to Engraissement or PostSevrage
        const lotId = data.lotId;

        let lotEngraissementId = null;
        let lotPostSevrageId = null;

        const eng = await prisma.lotEngraissement.findUnique({ where: { id: lotId } });
        if (eng) {
            lotEngraissementId = lotId;
        } else {
            const ps = await prisma.lotPostSevrage.findUnique({ where: { id: lotId } });
            if (ps) {
                lotPostSevrageId = lotId;
            } else {
                return res.status(400).json({ error: 'Lot not found' });
            }
        }

        const newPesee = await prisma.pesee.create({
            data: {
                lotEngraissementId,
                lotPostSevrageId,
                date: new Date(data.date),
                poidsMoyen: data.poidsMoyen,
                nombrePeses: data.nombrePeses,
                notes: data.notes || "",
            },
        });

        // Return with lotId property for frontend compatibility
        res.status(201).json({
            ...newPesee,
            lotId: lotEngraissementId || lotPostSevrageId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating pesee' });
    }
};

// No update/remove in frontend storage.ts but good to have API
export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedPesee = await prisma.pesee.update({
            where: { id },
            data: {
                ...data,
                date: data.date ? new Date(data.date) : undefined,
            },
        });
        res.json({
            ...updatedPesee,
            lotId: updatedPesee.lotEngraissementId || updatedPesee.lotPostSevrageId
        });
    } catch (error) {
        res.status(500).json({ error: 'Error updating pesee' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.pesee.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting pesee' });
    }
};
