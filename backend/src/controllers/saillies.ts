import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAll = async (req: Request, res: Response) => {
    try {
        const saillies = await prisma.saillie.findMany({
            include: {
                truie: true
            }
        });
        res.json(saillies);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching saillies' });
    }
};

// ERREUR #4: Validation du statut de la truie avant création
export const create = async (req: Request, res: Response) => {
    try {
        const data = req.body;

        // Vérifier que la truie existe et est active
        const truie = await prisma.truie.findUnique({ where: { id: data.truieId } });
        if (!truie) {
            return res.status(404).json({ error: 'Truie non trouvée' });
        }
        if (truie.statut === 'reformee' || truie.statut === 'vendue') {
            return res.status(400).json({ error: 'Impossible de créer une saillie pour une truie réformée ou vendue' });
        }

        const newSaillie = await prisma.saillie.create({
            data: {
                truieId: data.truieId,
                date: new Date(data.date),
                methode: data.methode,
                employe: data.employe,
                datePrevueMiseBas: new Date(data.datePrevueMiseBas),
                statut: data.statut,
            },
        });
        res.status(201).json(newSaillie);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating saillie' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedSaillie = await prisma.saillie.update({
            where: { id },
            data: {
                ...data,
                date: data.date ? new Date(data.date) : undefined,
                datePrevueMiseBas: data.datePrevueMiseBas ? new Date(data.datePrevueMiseBas) : undefined,
            },
        });
        res.json(updatedSaillie);
    } catch (error) {
        res.status(500).json({ error: 'Error updating saillie' });
    }
};

// ERREUR #7 et #12: Vérifier mise bas et restaurer statut truie
export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Vérifier s'il existe une mise bas
        const miseBas = await prisma.miseBas.findUnique({
            where: { saillieId: id }
        });
        if (miseBas) {
            return res.status(400).json({ 
                error: 'Impossible de supprimer cette saillie car une mise bas y est associée. Supprimez d\'abord la mise bas.' 
            });
        }

        // Restaurer le statut de la truie si la saillie était confirmée
        const saillie = await prisma.saillie.findUnique({ where: { id } });
        if (saillie && saillie.statut === 'confirmee') {
            await prisma.truie.update({
                where: { id: saillie.truieId },
                data: { statut: 'active' }
            });
        }

        await prisma.saillie.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting saillie' });
    }
};

// ERREUR #17: Créer une alerte lors de la confirmation
export const confirm = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const saillie = await prisma.saillie.findUnique({
            where: { id },
            include: { truie: true }
        });

        if (!saillie) {
            return res.status(404).json({ error: 'Saillie non trouvée' });
        }

        const updatedSaillie = await prisma.saillie.update({
            where: { id },
            data: {
                statut: 'confirmee',
            },
        });
        
        // Mettre à jour le statut de la truie
        await prisma.truie.update({
            where: { id: updatedSaillie.truieId },
            data: { statut: 'gestante' },
        });

        // Créer une alerte pour la saillie confirmée
        await prisma.alert.create({
            data: {
                type: 'mise_bas',
                message: `Saillie confirmée pour ${saillie.truie.identification} - Mise bas prévue le ${new Date(saillie.datePrevueMiseBas).toLocaleDateString('fr-FR')}`,
                date: new Date(),
                read: false,
                relatedId: updatedSaillie.id,
            }
        });
        
        res.json(updatedSaillie);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error confirming saillie' });
    }
};

export const fail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const saillie = await prisma.saillie.findUnique({
            where: { id },
        });
        
        if (!saillie) {
            return res.status(404).json({ error: 'Saillie not found' });
        }
        
        const updatedSaillie = await prisma.saillie.update({
            where: { id },
            data: {
                statut: 'echouee',
            },
        });
        
        // Reset truie status back to active
        await prisma.truie.update({
            where: { id: saillie.truieId },
            data: { statut: 'active' },
        });
        
        res.json(updatedSaillie);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error marking saillie as failed' });
    }
};
