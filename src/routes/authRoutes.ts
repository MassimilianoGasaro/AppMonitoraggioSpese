import express from 'express';
import { register, login, logout, test, verifyToken, getMe } from '../controllers/authController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = express.Router();

// Rotte pubbliche
router.post('/register', register);
router.post('/login', login);

// Rotte protette
router.post('/logout', verifyToken, logout);
router.get('/me', verifyToken, getMe);
router.get('/test', requireAuth, test);

export default router;
