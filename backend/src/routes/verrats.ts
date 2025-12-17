import { Router } from 'express';
import * as verratsController from '../controllers/verrats';

const router = Router();

router.get('/', verratsController.getAll);
router.post('/', verratsController.create);
router.put('/:id', verratsController.update);
router.delete('/:id', verratsController.remove);

export default router;
