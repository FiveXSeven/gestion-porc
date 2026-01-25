import { Router } from 'express';
import * as misesBasController from '../controllers/mises-bas';
import { validateIdParam } from '../middleware/validate-id';

const router = Router();

router.get('/', misesBasController.getAll);
router.post('/', misesBasController.create);
router.put('/:id', validateIdParam, misesBasController.update);
router.delete('/:id', validateIdParam, misesBasController.remove);

export default router;
