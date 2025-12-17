import { Router } from 'express';
import * as misesBasController from '../controllers/mises-bas';

const router = Router();

router.get('/', misesBasController.getAll);
router.post('/', misesBasController.create);
router.put('/:id', misesBasController.update);
router.delete('/:id', misesBasController.remove);

export default router;
