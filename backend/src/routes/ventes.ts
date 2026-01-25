import { Router } from 'express';
import * as ventesController from '../controllers/ventes';
import { validateIdParam } from '../middleware/validate-id';

const router = Router();

router.get('/', ventesController.getAll);
router.post('/', ventesController.create);
router.put('/:id', validateIdParam, ventesController.update);
router.delete('/:id', validateIdParam, ventesController.remove);

export default router;
