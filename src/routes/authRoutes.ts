import express from 'express';
import { register, login, logout, test } from '../controllers/authController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/', requireAuth, test);

export default router;
