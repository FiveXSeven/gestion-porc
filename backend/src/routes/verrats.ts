import { Router } from 'express';
import * as verratsController from '../controllers/verrats';

const router = Router();

router.get('/', verratsController.getAll);
router.post('/', verratsController.create);
router.put('/:id', verratsController.update);
router.delete('/:id', verratsController.remove);
router.post('/:id/reforme', verratsController.reforme);
router.get('/:id/stats', verratsController.getStats);

export default router;
