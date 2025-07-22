import express from 'express';
import { 
    getAllExpenseTypes,
    getAllExpenseTypesAdmin,
    getExpenseTypeById 
} from '../controllers/typologiesController';
import { isAuthenticated } from '../middlewares/authMiddleware';

const router = express.Router();

// GET /api/expense-types - Ottieni tutti i tipi attivi (pubblico)
router.get('/', getAllExpenseTypes);

// GET /api/expense-types/admin - Ottieni tutti i tipi inclusi inattivi (protetto)
router.get('/admin', isAuthenticated, getAllExpenseTypesAdmin);

// GET /api/expense-types/:id - Ottieni tipo specifico (pubblico)
router.get('/:id', getExpenseTypeById);

export default router;