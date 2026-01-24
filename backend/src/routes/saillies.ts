import { Router } from 'express';
import * as sailliesController from '../controllers/saillies';
import { validateIdParam } from '../middleware/validate-id';

const router = Router();

router.get('/', sailliesController.getAll);
router.post('/', sailliesController.create);
router.put('/:id', validateIdParam, sailliesController.update);
router.delete('/:id', validateIdParam, sailliesController.remove);
router.post('/:id/confirm', validateIdParam, sailliesController.confirm);
router.post('/:id/fail', validateIdParam, sailliesController.fail);

export default router;

