import { Router } from 'express';
import * as sailliesController from '../controllers/saillies';

const router = Router();

router.get('/', sailliesController.getAll);
router.post('/', sailliesController.create);
router.put('/:id', sailliesController.update);
router.delete('/:id', sailliesController.remove);

export default router;
