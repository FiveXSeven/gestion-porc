import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAll = async (req: Request, res: Response) => {
    try {
        const ventes = await prisma.vente.findMany();
        res.json(ventes);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching ventes' });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const newVente = await prisma.vente.create({
            data: {
                date: new Date(data.date),
                typeAnimal: data.typeAnimal,
                quantite: data.quantite,
                poidsTotal: data.poidsTotal,
                prixUnitaire: data.prixUnitaire,
                prixTotal: data.prixTotal,
                acheteur: data.acheteur,
                notes: data.notes || "",
            },
        });
        res.status(201).json(newVente);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating vente' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedVente = await prisma.vente.update({
            where: { id },
            data: {
                ...data,
                date: data.date ? new Date(data.date) : undefined,
            },
        });
        res.json(updatedVente);
    } catch (error) {
        res.status(500).json({ error: 'Error updating vente' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.vente.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting vente' });
    }
};
