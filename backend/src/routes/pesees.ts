import { Router } from 'express';
import * as peseesController from '../controllers/pesees';
import { validateIdParam } from '../middleware/validate-id';

const router = Router();

router.get('/', peseesController.getAll);
router.post('/', peseesController.create);
router.put('/:id', validateIdParam, peseesController.update);
router.delete('/:id', validateIdParam, peseesController.remove);

export default router;
