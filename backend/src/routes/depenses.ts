import { Router } from 'express';
import * as depensesController from '../controllers/depenses';
import { validateIdParam } from '../middleware/validate-id';

const router = Router();

router.get('/', depensesController.getAll);
router.post('/', depensesController.create);
router.put('/:id', validateIdParam, depensesController.update);
router.delete('/:id', validateIdParam, depensesController.remove);

export default router;
