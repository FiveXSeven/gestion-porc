import { Router } from 'express';
import * as truiesController from '../controllers/truies';
import { validateIdParam } from '../middleware/validate-id';

const router = Router();

router.get('/', truiesController.getAll);
router.get('/archived', truiesController.getArchived);
router.post('/', truiesController.create);
router.put('/:id', validateIdParam, truiesController.update);
router.delete('/:id', validateIdParam, truiesController.remove);
router.post('/:id/restore', validateIdParam, truiesController.restore);

export default router;
