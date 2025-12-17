import { Router } from 'express';
import * as depensesController from '../controllers/depenses';

const router = Router();

router.get('/', depensesController.getAll);
router.post('/', depensesController.create);
router.put('/:id', depensesController.update);
router.delete('/:id', depensesController.remove);

export default router;
