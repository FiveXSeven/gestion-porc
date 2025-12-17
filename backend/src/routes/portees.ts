import { Router } from 'express';
import * as porteesController from '../controllers/portees';

const router = Router();

router.get('/', porteesController.getAll);
router.post('/', porteesController.create);
router.put('/:id', porteesController.update);
router.delete('/:id', porteesController.remove);

export default router;
