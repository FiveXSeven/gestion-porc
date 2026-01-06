import { Router } from 'express';
import { getAllMortalites, createMortalite, getMortalitesForLot, deleteMortalite } from '../controllers/mortalites';

const router = Router();

router.get('/', getAllMortalites);
router.post('/', createMortalite);
router.get('/:lotType/:lotId', getMortalitesForLot);
router.delete('/:id', deleteMortalite);

export default router;
