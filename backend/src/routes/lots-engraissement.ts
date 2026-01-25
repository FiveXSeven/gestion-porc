import { Router } from 'express';
import * as lotsEngraissementController from '../controllers/lots-engraissement';
import { validateIdParam } from '../middleware/validate-id';

const router = Router();

router.get('/', lotsEngraissementController.getAll);
router.post('/', lotsEngraissementController.create);
router.put('/:id', validateIdParam, lotsEngraissementController.update);
router.delete('/:id', validateIdParam, lotsEngraissementController.remove);
router.post('/:id/mark-ready', validateIdParam, lotsEngraissementController.markReady);

export default router;

