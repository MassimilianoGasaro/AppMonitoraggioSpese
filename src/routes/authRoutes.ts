import express from 'express';
import { register, login, logout, test } from '../controllers/authController';
import { isAuthenticated, getMe } from '../middlewares/authMiddleware';

const router = express.Router();

// Rotte pubbliche
router.post('/register', register);
router.post('/login', login);

// Rotte protette - richiedono JWT token
router.post('/logout', isAuthenticated, logout);
router.get('/me', isAuthenticated, getMe);
router.get('/test', isAuthenticated, test);

export default router;
