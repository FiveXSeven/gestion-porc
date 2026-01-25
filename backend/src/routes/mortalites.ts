import { Router } from 'express';
import { getAllMortalites, createMortalite, getMortalitesForLot, deleteMortalite } from '../controllers/mortalites';
import { validateIdParam } from '../middleware/validate-id';

const router = Router();

router.get('/', getAllMortalites);
router.post('/', createMortalite);
router.get('/:lotType/:lotId', getMortalitesForLot);
router.delete('/:id', validateIdParam, deleteMortalite);

export default router;
