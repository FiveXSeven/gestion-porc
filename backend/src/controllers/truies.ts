import { Request, Response } from 'express';
import prisma from '../prisma';

// ERREUR #18: Exclure les truies archivées par défaut
export const getAll = async (req: Request, res: Response) => {
    try {
        const includeArchived = req.query.includeArchived === 'true';
        const truies = await prisma.truie.findMany({
            where: includeArchived ? {} : { archived: false }
        });
        res.json(truies);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching truies' });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const newTruie = await prisma.truie.create({
            data: {
                identification: data.identification,
                race: data.race,
                dateEntree: new Date(data.dateEntree),
                dateNaissance: new Date(data.dateNaissance),
                poids: data.poids,
                statut: data.statut,
                notes: data.notes || "",
            },
        });
        res.status(201).json(newTruie);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating truie' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedTruie = await prisma.truie.update({
            where: { id },
            data: {
                ...data,
                dateEntree: data.dateEntree ? new Date(data.dateEntree) : undefined,
                dateNaissance: data.dateNaissance ? new Date(data.dateNaissance) : undefined,
            },
        });
        res.json(updatedTruie);
    } catch (error) {
        res.status(500).json({ error: 'Error updating truie' });
    }
};

// ERREUR #11 et #18: Vérifier saillies et soft delete
export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Vérifier s'il existe des saillies
        const saillie = await prisma.saillie.findFirst({
            where: { truieId: id }
        });
        if (saillie) {
            return res.status(400).json({ 
                error: 'Impossible de supprimer cette truie car des saillies y sont associées. Supprimez d\'abord les saillies.' 
            });
        }

        // Soft delete (archivage) au lieu de hard delete
        await prisma.truie.update({
            where: { id },
            data: { 
                archived: true,
                archivedAt: new Date()
            },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting truie' });
    }
};

// Endpoint pour récupérer les truies archivées
export const getArchived = async (req: Request, res: Response) => {
    try {
        const truies = await prisma.truie.findMany({
            where: { archived: true }
        });
        res.json(truies);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching archived truies' });
    }
};

// Endpoint pour restaurer une truie archivée
export const restore = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const truie = await prisma.truie.update({
            where: { id },
            data: { 
                archived: false,
                archivedAt: null
            },
        });
        res.json(truie);
    } catch (error) {
        res.status(500).json({ error: 'Error restoring truie' });
    }
};
