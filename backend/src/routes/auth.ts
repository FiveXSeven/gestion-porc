import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Rate limiting strict pour auth
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // augmenté de 5 à 20 tentatives
    message: { error: 'Trop de tentatives. Réessayez plus tard.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.get('/me', authenticateToken, authController.getMe);

export default router;
