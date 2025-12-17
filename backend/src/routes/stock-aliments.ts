import { Router } from 'express';
import * as stockAlimentsController from '../controllers/stock-aliments';

const router = Router();

router.get('/', stockAlimentsController.getAll);
router.post('/', stockAlimentsController.create);
router.put('/:id', stockAlimentsController.update);
router.delete('/:id', stockAlimentsController.remove);

export default router;
