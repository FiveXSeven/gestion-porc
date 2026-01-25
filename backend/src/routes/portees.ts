import { Router } from 'express';
import * as porteesController from '../controllers/portees';
import { validateIdParam } from '../middleware/validate-id';

const router = Router();

router.get('/', porteesController.getAll);
router.post('/', porteesController.create);
router.put('/:id', validateIdParam, porteesController.update);
router.delete('/:id', validateIdParam, porteesController.remove);

export default router;
