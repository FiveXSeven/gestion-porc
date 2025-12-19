import { Request, Response } from 'express';
import prisma from '../prisma';

// Get all vaccinations
export const getAllVaccinations = async (req: Request, res: Response) => {
    try {
        const vaccinations = await prisma.vaccination.findMany({
            orderBy: { date: 'desc' }
        });
        res.json(vaccinations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch vaccinations' });
    }
};

// Create vaccination
export const createVaccination = async (req: Request, res: Response) => {
    try {
        const { date, nom, type, lotType, lotId, truieId, dateRappel, notes } = req.body;

        const vaccination = await prisma.vaccination.create({
            data: {
                date: new Date(date),
                nom,
                type,
                lotType,
                lotId: lotId || null,
                truieId: truieId || null,
                dateRappel: dateRappel ? new Date(dateRappel) : null,
                notes: notes || '',
            },
        });

        // Create alert for reminder if dateRappel is set
        if (dateRappel) {
            await prisma.alert.create({
                data: {
                    type: 'sante',
                    message: `Rappel vaccination: ${nom} prévu le ${new Date(dateRappel).toLocaleDateString('fr-FR')}`,
                    date: new Date(),
                    read: false,
                    relatedId: vaccination.id,
                }
            });
        }

        res.status(201).json(vaccination);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create vaccination' });
    }
};

// Delete vaccination
export const deleteVaccination = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.vaccination.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete vaccination' });
    }
};

// Get all traitements
export const getAllTraitements = async (req: Request, res: Response) => {
    try {
        const traitements = await prisma.traitement.findMany({
            orderBy: { date: 'desc' }
        });
        res.json(traitements);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch traitements' });
    }
};

// Create traitement
export const createTraitement = async (req: Request, res: Response) => {
    try {
        const { date, nom, medicament, dureeJours, lotType, lotId, truieId, notes } = req.body;

        const traitement = await prisma.traitement.create({
            data: {
                date: new Date(date),
                nom,
                medicament,
                dureeJours,
                lotType,
                lotId: lotId || null,
                truieId: truieId || null,
                notes: notes || '',
            },
        });

        res.status(201).json(traitement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create traitement' });
    }
};

// Delete traitement
export const deleteTraitement = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.traitement.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete traitement' });
    }
};
