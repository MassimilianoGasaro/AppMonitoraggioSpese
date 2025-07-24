import express from 'express';
import { 
    getAllExpenseTypes,
    getAllExpenseTypesAdmin,
    getAllExpenseTypesByTypology,
    getExpenseTypeById 
} from '../controllers/typologiesController';
import { isAuthenticated } from '../middlewares/authMiddleware';

const router = express.Router();

// GET /api/expense-types - Ottieni tutti i tipi attivi per tipologia (pubblico)
router.get('/', getAllExpenseTypesByTypology);

// GET /api/expense-types/all - Ottieni tutti i tipi attivi (pubblico)
router.get('/all', getAllExpenseTypes);

// GET /api/expense-types/admin - Ottieni tutti i tipi inclusi inattivi (protetto)
router.get('/admin', isAuthenticated, getAllExpenseTypesAdmin);

// GET /api/expense-types/:id - Ottieni tipo specifico (pubblico)
router.get('/:id', getExpenseTypeById);

export default router;