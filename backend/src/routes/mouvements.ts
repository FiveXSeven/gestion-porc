import { Router } from 'express';
import * as mouvementsController from '../controllers/mouvements';

const router = Router();

router.get('/', mouvementsController.getAll);
router.get('/filter', mouvementsController.getByPeriod);
router.get('/stats', mouvementsController.getStats);
router.post('/', mouvementsController.create);
router.delete('/:id', mouvementsController.remove);

export default router;
