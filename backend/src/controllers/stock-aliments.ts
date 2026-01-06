import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAll = async (req: Request, res: Response) => {
    try {
        const stocks = await prisma.stockAliment.findMany();
        res.json(stocks);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching stock aliments' });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const newStock = await prisma.stockAliment.create({
            data: {
                nom: data.nom,
                type: data.type,
                quantite: data.quantite,
                poidsSac: data.poidsSac,
                dateMiseAJour: new Date(data.dateMiseAJour),
            },
        });
        res.status(201).json(newStock);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating stock aliment' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedStock = await prisma.stockAliment.update({
            where: { id },
            data: {
                ...data,
                dateMiseAJour: data.dateMiseAJour ? new Date(data.dateMiseAJour) : undefined,
            },
        });
        res.json(updatedStock);
    } catch (error) {
        res.status(500).json({ error: 'Error updating stock aliment' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.stockAliment.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting stock aliment' });
    }
};
