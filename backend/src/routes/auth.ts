import { Router } from 'express';
import * as authController from '../controllers/auth';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authController.getMe);

export default router;
