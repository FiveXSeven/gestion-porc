import { Router } from 'express';
import * as peseesController from '../controllers/pesees';

const router = Router();

router.get('/', peseesController.getAll);
router.post('/', peseesController.create);
router.put('/:id', peseesController.update);
router.delete('/:id', peseesController.remove);

export default router;
