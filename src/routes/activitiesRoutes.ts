import express from 'express';
import { 
  getByUserIdAsync, 
  createAsync, 
  updateAsync, 
  deleteAsync, 
  getByIdAsync
} from '../controllers/activitiesController';
import { isAuthenticated, authenticateAndOwn } from '../middlewares/authMiddleware';

const router = express.Router();

// Tutte le routes delle attività richiedono autenticazione JWT
// Il client deve inviare: Authorization: Bearer <jwt-token>

// GET /api/activities/user - Ottieni le attività dell'utente autenticato
// Query params: ?page=1&limit=10&type=expense&startDate=2025-01-01&endDate=2025-12-31
router.get('/user', authenticateAndOwn, getByUserIdAsync);

// GET /api/activities/:id - Ottieni attività per ID (URI parameter)
router.get('/:id', authenticateAndOwn, getByIdAsync);

// POST /api/activities - Crea nuova attività
router.post('/', isAuthenticated, createAsync);

// PUT /api/activities/:id - Aggiorna attività
router.put('/:id', authenticateAndOwn, updateAsync);

// DELETE /api/activities/:id - Elimina attività
router.delete('/:id', authenticateAndOwn, deleteAsync);

// Esempi aggiuntivi di come gestire diversi tipi di parametri:

// GET /api/activities/search?q=spesa&type=expense&minAmount=10&maxAmount=100
// Query parameters: req.query.q, req.query.type, req.query.minAmount, req.query.maxAmount
// router.get('/search', authenticateAndOwn, searchActivitiesAsync);

// GET /api/activities/user/:userId/category/:categoryId
// URI parameters: req.params.userId, req.params.categoryId  
// router.get('/user/:userId/category/:categoryId', authenticateAndOwn, getActivitiesByUserAndCategoryAsync);

// POST /api/activities/bulk
// Body parameters: req.body.activities (array di attività)
// router.post('/bulk', authenticateAndOwn, createMultipleActivitiesAsync);

export default router;