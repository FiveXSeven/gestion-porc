import { Router } from 'express';
import * as lotsPostSevrageController from '../controllers/lots-post-sevrage';

const router = Router();

router.get('/', lotsPostSevrageController.getAll);
router.post('/', lotsPostSevrageController.create);
router.put('/:id', lotsPostSevrageController.update);
router.delete('/:id', lotsPostSevrageController.remove);

export default router;
