import { Router } from 'express';
import * as lotsPostSevrageController from '../controllers/lots-post-sevrage';
import { validateIdParam } from '../middleware/validate-id';

const router = Router();

router.get('/', lotsPostSevrageController.getAll);
router.post('/', lotsPostSevrageController.create);
router.put('/:id', validateIdParam, lotsPostSevrageController.update);
router.delete('/:id', validateIdParam, lotsPostSevrageController.remove);
router.post('/:id/mark-ready', validateIdParam, lotsPostSevrageController.markReady);

export default router;

