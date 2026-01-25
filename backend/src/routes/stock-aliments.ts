import { Router } from 'express';
import * as stockAlimentsController from '../controllers/stock-aliments';
import { validateIdParam } from '../middleware/validate-id';

const router = Router();

router.get('/', stockAlimentsController.getAll);
router.post('/', stockAlimentsController.create);
router.put('/:id', validateIdParam, stockAlimentsController.update);
router.delete('/:id', validateIdParam, stockAlimentsController.remove);

export default router;
