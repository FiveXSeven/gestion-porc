import { Router } from 'express';
import { getAllConsommations, createConsommation, getConsommationsForLot, deleteConsommation } from '../controllers/consommations';

const router = Router();

router.get('/', getAllConsommations);
router.post('/', createConsommation);
router.get('/:lotType/:lotId', getConsommationsForLot);
router.delete('/:id', deleteConsommation);

export default router;
