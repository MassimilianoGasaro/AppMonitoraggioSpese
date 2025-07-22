import { ExpenseType } from '../models/expensesTypology';
import logger from '../logger/logger';

const expenseTypesData = [
    { name: 'Alimentari', description: 'Spese per cibo e bevande', icon: '🛒', color: '#28a745' },
    { name: 'Trasporti', description: 'Benzina, trasporti pubblici', icon: '🚗', color: '#007bff' },
    { name: 'Casa', description: 'Affitto, bollette, manutenzione', icon: '🏠', color: '#fd7e14' },
    { name: 'Salute', description: 'Medico, farmaci, palestra', icon: '⚕️', color: '#dc3545' },
    { name: 'Intrattenimento', description: 'Cinema, ristoranti, hobby', icon: '🎬', color: '#e83e8c' },
    { name: 'Abbigliamento', description: 'Vestiti e accessori', icon: '👕', color: '#6f42c1' },
    { name: 'Educazione', description: 'Libri, corsi, formazione', icon: '📚', color: '#20c997' },
    { name: 'Tecnologia', description: 'Elettronica, software', icon: '💻', color: '#6c757d' },
    { name: 'Viaggi', description: 'Vacanze e trasferte', icon: '✈️', color: '#ffc107' },
    { name: 'Altri', description: 'Spese varie', icon: '💰', color: '#17a2b8' }
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
        logger.info(`Inseriti ${expenseTypesData.length} tipi di spesa`);
        
    } catch (error) {
        logger.error('Errore nel seeding dei tipi di spesa:', error);
        throw error;
    }
};