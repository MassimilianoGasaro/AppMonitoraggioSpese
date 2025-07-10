import express from 'express';
import { 
  getAllAsync, 
  getByUserIdAsync, 
  createAsync, 
  updateAsync, 
  deleteAsync 
} from '../controllers/activitiesController';
import { isAuthenticated, authenticateAndOwn } from '../middlewares/authMiddleware';

const router = express.Router();

// Tutte le routes delle attività richiedono autenticazione JWT
// Il client deve inviare: Authorization: Bearer <jwt-token>

// GET /api/activities - Ottieni tutte le attività (solo per admin)
router.get('/', isAuthenticated, getAllAsync);

// GET /api/activities/user - Ottieni le attività dell'utente autenticato
router.get('/user', authenticateAndOwn, getByUserIdAsync);

// POST /api/activities - Crea nuova attività
router.post('/', authenticateAndOwn, createAsync);

// PUT /api/activities/:id - Aggiorna attività
router.put('/:id', isAuthenticated, updateAsync);

// DELETE /api/activities/:id - Elimina attività
router.delete('/:id', isAuthenticated, deleteAsync);

export default router;