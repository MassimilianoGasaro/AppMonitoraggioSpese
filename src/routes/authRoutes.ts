import express from 'express';
import { register, login, logout, forgotPassword, resetPassword, validateResetToken } from '../controllers/authController';

const router = express.Router();

// Rotte pubbliche
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/validate-reset-token/:token', validateResetToken);

export default router;
