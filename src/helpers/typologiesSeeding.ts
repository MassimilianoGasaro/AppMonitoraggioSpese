import { ExpenseType } from '../models/expensesTypology';
import logger from '../logger/logger';

const expenseTypesData = [
    { 
        name: 'Stipendio', 
        description: 'Retribuzione dal lavoro', 
        icon: '💼', 
        color: '#28a745',
        type: 'income'
    },
    { 
        name: 'Freelance', 
        description: 'Guadagni da lavoro autonomo', 
        icon: '💻', 
        color: '#20c997',
        type: 'income'
    },
    { 
        name: 'Investimenti', 
        description: 'Dividendi, interessi, capital gain', 
        icon: '📈', 
        color: '#17a2b8',
        type: 'income'
    },
    { 
        name: 'Bonus', 
        description: 'Premi, bonus, tredicesima', 
        icon: '🎁', 
        color: '#ffc107',
        type: 'income'
    },
    { 
        name: 'Vendite', 
        description: 'Vendita di oggetti personali', 
        icon: '🛍️', 
        color: '#fd7e14',
        type: 'income'
    },
    { 
        name: 'Altre Entrate', 
        description: 'Entrate varie', 
        icon: '💰', 
        color: '#6f42c1',
        type: 'income'
    },

    // TIPI DI USCITA
    { 
        name: 'Alimentari', 
        description: 'Spese per cibo e bevande', 
        icon: '🛒', 
        color: '#28a745',
        type: 'expense'
    },
    { 
        name: 'Trasporti', 
        description: 'Benzina, trasporti pubblici', 
        icon: '🚗', 
        color: '#007bff',
        type: 'expense'
    },
    { 
        name: 'Casa', 
        description: 'Affitto, bollette, manutenzione', 
        icon: '🏠', 
        color: '#fd7e14',
        type: 'expense'
    },
    { 
        name: 'Salute', 
        description: 'Medico, farmaci, palestra', 
        icon: '⚕️', 
        color: '#dc3545',
        type: 'expense'
    },
    { 
        name: 'Intrattenimento', 
        description: 'Cinema, ristoranti, hobby', 
        icon: '🎬', 
        color: '#e83e8c',
        type: 'expense'
    },
    { 
        name: 'Abbigliamento', 
        description: 'Vestiti e accessori', 
        icon: '👕', 
        color: '#6f42c1',
        type: 'expense'
    },
    { 
        name: 'Educazione', 
        description: 'Libri, corsi, formazione', 
        icon: '📚', 
        color: '#20c997',
        type: 'expense'
    },
    { 
        name: 'Tecnologia', 
        description: 'Elettronica, software', 
        icon: '💻', 
        color: '#6c757d',
        type: 'expense'
    },
    { 
        name: 'Viaggi', 
        description: 'Vacanze e trasferte', 
        icon: '✈️', 
        color: '#ffc107',
        type: 'expense'
    },
    { 
        name: 'Servizi Finanziari', 
        description: 'Commissioni bancarie, assicurazioni', 
        icon: '🏦', 
        color: '#495057',
        type: 'expense'
    },
    { 
        name: 'Regali', 
        description: 'Regali per amici e famiglia', 
        icon: '🎁', 
        color: '#e83e8c',
        type: 'expense'
    },
    { 
        name: 'Altre Uscite', 
        description: 'Spese varie', 
        icon: '�', 
        color: '#17a2b8',
        type: 'expense'
    }
];

export const seedExpenseTypes = async () => {
    try {
        // Controlla se esistono già dati
        const existingCount = await ExpenseType.countDocuments();
        
        if (existingCount > 0) {
            logger.info(`Tipi di spesa già presenti: ${existingCount}`);
            return;
        }

        // Inserisci i dati iniziali
        await ExpenseType.insertMany(expenseTypesData);
        
        // Log dettagliato per categorie
        const incomeCount = expenseTypesData.filter(t => t.type === 'income').length;
        const expenseCount = expenseTypesData.filter(t => t.type === 'expense').length;
        
        logger.info(`Seeding completato!`);
        logger.info(`- Tipi di income inseriti: ${incomeCount}`);
        logger.info(`- Tipi di expense inseriti: ${expenseCount}`);
        logger.info(`- Totale tipi inseriti: ${expenseTypesData.length}`);
        
    } catch (error) {
        logger.error('Errore nel seeding dei tipi di spesa:', error);
        throw error;
    }
};