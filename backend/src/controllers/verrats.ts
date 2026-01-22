import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAll = async (req: Request, res: Response) => {
    try {
        const verrats = await prisma.verrat.findMany({
            where: { statut: { not: 'vendu' } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(verrats);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching verrats' });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const newVerrat = await prisma.verrat.create({
            data: {
                identification: data.identification,
                race: data.race,
                dateNaissance: new Date(data.dateNaissance),
                dateEntree: new Date(data.dateEntree),
                poids: data.poids,
                statut: data.statut || 'actif',
                notes: data.notes || '',
            },
        });

        // Créer un mouvement d'entrée pour la traçabilité
        await prisma.mouvement.create({
            data: {
                date: new Date(data.dateEntree),
                typeMouvement: 'entree',
                typeAnimal: 'verrat',
                motif: 'achat',
                quantite: 1,
                identification: data.identification,
                origine: data.notes || 'Non spécifié',
                poids: data.poids,
            }
        });

        res.status(201).json(newVerrat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating verrat' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedVerrat = await prisma.verrat.update({
            where: { id },
            data: {
                ...data,
                dateNaissance: data.dateNaissance ? new Date(data.dateNaissance) : undefined,
                dateEntree: data.dateEntree ? new Date(data.dateEntree) : undefined,
            },
        });
        res.json(updatedVerrat);
    } catch (error) {
        res.status(500).json({ error: 'Error updating verrat' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        // Vérifier s'il y a des saillies liées
        const sailliesCount = await prisma.saillie.count({ where: { verratId: id } });
        if (sailliesCount > 0) {
            return res.status(400).json({ 
                error: 'Impossible de supprimer ce verrat car il a des saillies associées. Utilisez la réforme à la place.' 
            });
        }

        await prisma.verrat.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting verrat' });
    }
};

// Réformer un verrat
export const reforme = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const verrat = await prisma.verrat.findUnique({ where: { id } });
        
        if (!verrat) {
            return res.status(404).json({ error: 'Verrat non trouvé' });
        }

        const updatedVerrat = await prisma.verrat.update({
            where: { id },
            data: { statut: 'reforme' },
        });

        // Créer un mouvement de sortie pour la traçabilité
        await prisma.mouvement.create({
            data: {
                date: new Date(),
                typeMouvement: 'sortie',
                typeAnimal: 'verrat',
                motif: 'reforme',
                quantite: 1,
                identification: verrat.identification,
                poids: verrat.poids,
            }
        });

        res.json(updatedVerrat);
    } catch (error) {
        res.status(500).json({ error: 'Error reforming verrat' });
    }
};

// Statistiques du verrat (taux de réussite des saillies)
export const getStats = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        const saillies = await prisma.saillie.findMany({
            where: { verratId: id }
        });

        const total = saillies.length;
        const confirmees = saillies.filter(s => s.statut === 'confirmee').length;
        const echouees = saillies.filter(s => s.statut === 'echouee').length;
        const enCours = saillies.filter(s => s.statut === 'en_cours').length;
        const tauxReussite = total > 0 ? Math.round((confirmees / (confirmees + echouees)) * 100) : 0;

        res.json({
            totalSaillies: total,
            confirmees,
            echouees,
            enCours,
            tauxReussite,
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching verrat stats' });
    }
};
