import { Router } from 'express';
import * as mouvementsController from '../controllers/mouvements';
import { validateIdParam } from '../middleware/validate-id';

const router = Router();

router.get('/', mouvementsController.getAll);
router.get('/filter', mouvementsController.getByPeriod);
router.get('/stats', mouvementsController.getStats);
router.post('/', mouvementsController.create);
router.delete('/:id', validateIdParam, mouvementsController.remove);

export default router;
