import { Request, Response } from 'express';
import prisma from '../prisma';

interface Mouvement {
    id: string;
    date: Date;
    typeMouvement: string;
    typeAnimal: string;
    motif: string;
    quantite: number;
    identification: string | null;
    origine: string | null;
    destination: string | null;
    poids: number | null;
    notes: string;
    createdAt: Date;
}

export const getAll = async (req: Request, res: Response) => {
    try {
        const mouvements = await prisma.mouvement.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(mouvements);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching mouvements' });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const newMouvement = await prisma.mouvement.create({
            data: {
                date: new Date(data.date),
                typeMouvement: data.typeMouvement,
                typeAnimal: data.typeAnimal,
                motif: data.motif,
                quantite: data.quantite,
                identification: data.identification || null,
                origine: data.origine || null,
                destination: data.destination || null,
                poids: data.poids || null,
                notes: data.notes || '',
            },
        });
        res.status(201).json(newMouvement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating mouvement' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.mouvement.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting mouvement' });
    }
};

// Récupérer le registre filtré par période
export const getByPeriod = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, typeAnimal, typeMouvement } = req.query;
        
        const where: Record<string, unknown> = {};
        
        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string),
            };
        }
        
        if (typeAnimal) {
            where.typeAnimal = typeAnimal;
        }
        
        if (typeMouvement) {
            where.typeMouvement = typeMouvement;
        }

        const mouvements = await prisma.mouvement.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        res.json(mouvements);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching mouvements by period' });
    }
};

// Statistiques du registre
export const getStats = async (req: Request, res: Response) => {
    try {
        const mouvements: Mouvement[] = await prisma.mouvement.findMany();
        
        const entrees = mouvements.filter((m: Mouvement) => m.typeMouvement === 'entree');
        const sorties = mouvements.filter((m: Mouvement) => m.typeMouvement === 'sortie');
        
        const totalEntrees = entrees.reduce((sum: number, m: Mouvement) => sum + m.quantite, 0);
        const totalSorties = sorties.reduce((sum: number, m: Mouvement) => sum + m.quantite, 0);
        
        // Par type d'animal
        const parTypeAnimal = {
            truie: {
                entrees: entrees.filter((m: Mouvement) => m.typeAnimal === 'truie').reduce((sum: number, m: Mouvement) => sum + m.quantite, 0),
                sorties: sorties.filter((m: Mouvement) => m.typeAnimal === 'truie').reduce((sum: number, m: Mouvement) => sum + m.quantite, 0),
            },
            verrat: {
                entrees: entrees.filter((m: Mouvement) => m.typeAnimal === 'verrat').reduce((sum: number, m: Mouvement) => sum + m.quantite, 0),
                sorties: sorties.filter((m: Mouvement) => m.typeAnimal === 'verrat').reduce((sum: number, m: Mouvement) => sum + m.quantite, 0),
            },
            porcelet: {
                entrees: entrees.filter((m: Mouvement) => m.typeAnimal === 'porcelet').reduce((sum: number, m: Mouvement) => sum + m.quantite, 0),
                sorties: sorties.filter((m: Mouvement) => m.typeAnimal === 'porcelet').reduce((sum: number, m: Mouvement) => sum + m.quantite, 0),
            },
            porc_engraissement: {
                entrees: entrees.filter((m: Mouvement) => m.typeAnimal === 'porc_engraissement').reduce((sum: number, m: Mouvement) => sum + m.quantite, 0),
                sorties: sorties.filter((m: Mouvement) => m.typeAnimal === 'porc_engraissement').reduce((sum: number, m: Mouvement) => sum + m.quantite, 0),
            },
        };

        // Par motif
        const parMotif = {
            naissance: mouvements.filter((m: Mouvement) => m.motif === 'naissance').reduce((sum: number, m: Mouvement) => sum + m.quantite, 0),
            achat: mouvements.filter((m: Mouvement) => m.motif === 'achat').reduce((sum: number, m: Mouvement) => sum + m.quantite, 0),
            vente: mouvements.filter((m: Mouvement) => m.motif === 'vente').reduce((sum: number, m: Mouvement) => sum + m.quantite, 0),
            mortalite: mouvements.filter((m: Mouvement) => m.motif === 'mortalite').reduce((sum: number, m: Mouvement) => sum + m.quantite, 0),
            reforme: mouvements.filter((m: Mouvement) => m.motif === 'reforme').reduce((sum: number, m: Mouvement) => sum + m.quantite, 0),
        };

        res.json({
            totalEntrees,
            totalSorties,
            solde: totalEntrees - totalSorties,
            parTypeAnimal,
            parMotif,
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching mouvements stats' });
    }
};
