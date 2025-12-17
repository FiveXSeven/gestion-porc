import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAll = async (req: Request, res: Response) => {
    try {
        const depenses = await prisma.depense.findMany();
        res.json(depenses);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching depenses' });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const newDepense = await prisma.depense.create({
            data: {
                date: new Date(data.date),
                categorie: data.categorie,
                montant: data.montant,
                description: data.description,
                fournisseur: data.fournisseur,
            },
        });
        res.status(201).json(newDepense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating depense' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedDepense = await prisma.depense.update({
            where: { id },
            data: {
                ...data,
                date: data.date ? new Date(data.date) : undefined,
            },
        });
        res.json(updatedDepense);
    } catch (error) {
        res.status(500).json({ error: 'Error updating depense' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.depense.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting depense' });
    }
};
