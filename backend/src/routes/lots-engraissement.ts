import { Router } from 'express';
import * as lotsEngraissementController from '../controllers/lots-engraissement';

const router = Router();

router.get('/', lotsEngraissementController.getAll);
router.post('/', lotsEngraissementController.create);
router.put('/:id', lotsEngraissementController.update);
router.delete('/:id', lotsEngraissementController.remove);
router.post('/:id/mark-ready', lotsEngraissementController.markReady);

export default router;

