import { Request, Response } from 'express';
import prisma from '../prisma';

// Get all mortalites
export const getAllMortalites = async (req: Request, res: Response) => {
    try {
        const mortalites = await prisma.mortalite.findMany({
            orderBy: { date: 'desc' },
            include: {
                lotEngraissement: true,
                lotPostSevrage: true,
            }
        });
        res.json(mortalites);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch mortalites' });
    }
};

// Create mortalite
export const createMortalite = async (req: Request, res: Response) => {
    try {
        const { date, nombre, cause, notes, lotEngraissementId, lotPostSevrageId } = req.body;

        // Create mortalite record
        const mortalite = await prisma.mortalite.create({
            data: {
                date: new Date(date),
                nombre,
                cause,
                notes: notes || '',
                lotEngraissementId: lotEngraissementId || null,
                lotPostSevrageId: lotPostSevrageId || null,
            },
        });

        // Update the lot's nombreActuel
        if (lotEngraissementId) {
            const lot = await prisma.lotEngraissement.findUnique({ where: { id: lotEngraissementId } });
            if (lot) {
                await prisma.lotEngraissement.update({
                    where: { id: lotEngraissementId },
                    data: { nombreActuel: Math.max(0, lot.nombreActuel - nombre) }
                });
            }
        } else if (lotPostSevrageId) {
            const lot = await prisma.lotPostSevrage.findUnique({ where: { id: lotPostSevrageId } });
            if (lot) {
                await prisma.lotPostSevrage.update({
                    where: { id: lotPostSevrageId },
                    data: { nombreActuel: Math.max(0, lot.nombreActuel - nombre) }
                });
            }
        }

        // Create alert for mortality
        const lotName = lotEngraissementId 
            ? (await prisma.lotEngraissement.findUnique({ where: { id: lotEngraissementId } }))?.identification
            : (await prisma.lotPostSevrage.findUnique({ where: { id: lotPostSevrageId! } }))?.identification;

        await prisma.alert.create({
            data: {
                type: 'sante',
                message: `Mortalité enregistrée: ${nombre} animal(s) - ${cause} - Lot ${lotName || 'inconnu'}`,
                date: new Date(),
                read: false,
                relatedId: mortalite.id,
            }
        });

        res.status(201).json(mortalite);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create mortalite' });
    }
};

// Get mortalites for a specific lot
export const getMortalitesForLot = async (req: Request, res: Response) => {
    try {
        const { lotType, lotId } = req.params;
        
        const where = lotType === 'engraissement' 
            ? { lotEngraissementId: lotId }
            : { lotPostSevrageId: lotId };

        const mortalites = await prisma.mortalite.findMany({
            where,
            orderBy: { date: 'desc' }
        });
        res.json(mortalites);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch mortalites for lot' });
    }
};

// ERREUR #2: Restaurer le nombre d'animaux avant suppression
export const deleteMortalite = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        const mortalite = await prisma.mortalite.findUnique({ where: { id } });
        if (!mortalite) {
            return res.status(404).json({ error: 'Mortalité non trouvée' });
        }

        // Restaurer le nombre d'animaux au lot
        if (mortalite.lotEngraissementId) {
            const lot = await prisma.lotEngraissement.findUnique({ 
                where: { id: mortalite.lotEngraissementId } 
            });
            if (lot) {
                await prisma.lotEngraissement.update({
                    where: { id: mortalite.lotEngraissementId },
                    data: { nombreActuel: lot.nombreActuel + mortalite.nombre }
                });
            }
        } else if (mortalite.lotPostSevrageId) {
            const lot = await prisma.lotPostSevrage.findUnique({ 
                where: { id: mortalite.lotPostSevrageId } 
            });
            if (lot) {
                await prisma.lotPostSevrage.update({
                    where: { id: mortalite.lotPostSevrageId },
                    data: { nombreActuel: lot.nombreActuel + mortalite.nombre }
                });
            }
        }

        await prisma.mortalite.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete mortalite' });
    }
};
