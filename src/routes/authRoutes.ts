import express from 'express';
import { register, login, logout } from '../controllers/authController';
import { isAuthenticated } from '../middlewares/authMiddleware';

const router = express.Router();

// Rotte pubbliche
router.post('/register', register);
router.post('/login', login);

// Rotte protette - richiedono JWT token
router.post('/logout', isAuthenticated, logout);

export default router;
