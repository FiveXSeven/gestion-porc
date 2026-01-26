import { Router } from 'express';
import { getAllConsommations, createConsommation, getConsommationsForLot, deleteConsommation } from '../controllers/consommations';
import { validateIdParam } from '../middleware/validate-id';

const router = Router();

router.get('/', getAllConsommations);
router.post('/', createConsommation);
router.get('/:lotType/:lotId', getConsommationsForLot);
router.delete('/:id', validateIdParam, deleteConsommation);

export default router;
