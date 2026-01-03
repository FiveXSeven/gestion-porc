import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAll = async (req: Request, res: Response) => {
    try {
        const lots = await prisma.lotEngraissement.findMany({
            include: {
                portee: true
            }
        });
        res.json(lots);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching lots engraissement' });
    }
};

// ERREUR #5 et #10: Validation unicité et nombre d'animaux
export const create = async (req: Request, res: Response) => {
    try {
        const data = req.body;

        // Vérifier l'unicité de l'identification
        const existing = await prisma.lotEngraissement.findUnique({
            where: { identification: data.identification }
        });
        if (existing) {
            return res.status(400).json({ error: 'Un lot avec cette identification existe déjà' });
        }

        // Valider le nombre d'animaux
        if (data.nombreActuel < 0 || data.nombreActuel > data.nombreInitial) {
            return res.status(400).json({ error: 'Le nombre actuel doit être entre 0 et le nombre initial' });
        }

        // ERREUR #6: Valider le poids cible
        if (data.poidsCible <= data.poidsEntree) {
            return res.status(400).json({ error: 'Le poids cible doit être supérieur au poids d\'entrée' });
        }

        const newLot = await prisma.lotEngraissement.create({
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
        res.status(500).json({ error: 'Error creating lot engraissement' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // ERREUR #10: Valider le nombre d'animaux si fourni
        if (data.nombreActuel !== undefined && data.nombreInitial !== undefined) {
            if (data.nombreActuel < 0 || data.nombreActuel > data.nombreInitial) {
                return res.status(400).json({ error: 'Le nombre actuel doit être entre 0 et le nombre initial' });
            }
        }

        const updatedLot = await prisma.lotEngraissement.update({
            where: { id },
            data: {
                ...data,
                dateCreation: data.dateCreation ? new Date(data.dateCreation) : undefined,
                dateEntree: data.dateEntree ? new Date(data.dateEntree) : undefined,
            },
        });
        res.json(updatedLot);
    } catch (error) {
        res.status(500).json({ error: 'Error updating lot engraissement' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.lotEngraissement.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting lot engraissement' });
    }
};

export const markReady = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedLot = await prisma.lotEngraissement.update({
            where: { id },
            data: {
                statut: 'pret',
            },
        });
        res.json(updatedLot);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error marking lot as ready' });
    }
};
