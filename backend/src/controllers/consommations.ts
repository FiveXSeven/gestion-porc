import { Request, Response } from 'express';
import prisma from '../prisma';

// Get all consommations
export const getAllConsommations = async (req: Request, res: Response) => {
    try {
        const consommations = await prisma.consommationAliment.findMany({
            orderBy: { date: 'desc' },
            include: {
                stockAliment: true,
                lotEngraissement: true,
                lotPostSevrage: true,
            }
        });
        res.json(consommations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch consommations' });
    }
};

// Create consommation
export const createConsommation = async (req: Request, res: Response) => {
    try {
        const { date, quantiteSacs, stockAlimentId, lotEngraissementId, lotPostSevrageId, notes } = req.body;

        // Create consommation record
        const consommation = await prisma.consommationAliment.create({
            data: {
                date: new Date(date),
                quantiteSacs,
                stockAlimentId,
                lotEngraissementId: lotEngraissementId || null,
                lotPostSevrageId: lotPostSevrageId || null,
                notes: notes || '',
            },
        });

        // Update stock quantity (decrease)
        const stock = await prisma.stockAliment.findUnique({ where: { id: stockAlimentId } });
        if (stock) {
            await prisma.stockAliment.update({
                where: { id: stockAlimentId },
                data: { 
                    quantite: Math.max(0, stock.quantite - quantiteSacs),
                    dateMiseAJour: new Date()
                }
            });
        }

        res.status(201).json(consommation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create consommation' });
    }
};

// Get consommations for a specific lot
export const getConsommationsForLot = async (req: Request, res: Response) => {
    try {
        const { lotType, lotId } = req.params;
        
        const where = lotType === 'engraissement' 
            ? { lotEngraissementId: lotId }
            : { lotPostSevrageId: lotId };

        const consommations = await prisma.consommationAliment.findMany({
            where,
            orderBy: { date: 'desc' },
            include: { stockAliment: true }
        });
        res.json(consommations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch consommations for lot' });
    }
};

// Delete consommation
export const deleteConsommation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.consommationAliment.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete consommation' });
    }
};
