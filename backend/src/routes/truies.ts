import { Router } from 'express';
import * as truiesController from '../controllers/truies';

const router = Router();

router.get('/', truiesController.getAll);
router.post('/', truiesController.create);
router.put('/:id', truiesController.update);
router.delete('/:id', truiesController.remove);

export default router;
