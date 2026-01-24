import { Router } from 'express';
import * as verratsController from '../controllers/verrats';
import { validateIdParam } from '../middleware/validate-id';

const router = Router();

router.get('/', verratsController.getAll);
router.post('/', verratsController.create);
router.put('/:id', validateIdParam, verratsController.update);
router.delete('/:id', validateIdParam, verratsController.remove);
router.post('/:id/reforme', validateIdParam, verratsController.reforme);
router.get('/:id/stats', validateIdParam, verratsController.getStats);

export default router;
