import { Router } from 'express';
import * as ventesController from '../controllers/ventes';

const router = Router();

router.get('/', ventesController.getAll);
router.post('/', ventesController.create);
router.put('/:id', ventesController.update);
router.delete('/:id', ventesController.remove);

export default router;
