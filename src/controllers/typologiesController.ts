import { Request, Response } from 'express';
import { ExpenseType } from '../models/expensesTypology';
import { ApiResponse } from '../helpers/apiResponse';

// GET - Ottieni tutti i tipi di spesa attivi
export const getAllExpenseTypes = async (req: Request, res: Response) => {
    try {
        const expenseTypes = await ExpenseType.findActive();

        return res.status(200).json(
            ApiResponse.success('Tipi di spesa recuperati con successo', expenseTypes)
        );
    } catch (error: any) {
        return res.status(500).json(
            ApiResponse.internalError('Errore nel recuperare i tipi di spesa', error.message)
        );
    }
};

// GET - Ottieni tutti i tipi di spesa attivi per tipologia
export const getAllExpenseTypesByTypology = async (req: Request, res: Response) => {
    try {
        const { type } = req.query;
        const expenseTypes = await ExpenseType.findActiveByType(type as 'income' | 'expense');

        return res.status(200).json(
            ApiResponse.success('Tipi di spesa recuperati con successo', expenseTypes)
        );
    } catch (error: any) {
        return res.status(500).json(
            ApiResponse.internalError('Errore nel recuperare i tipi di spesa', error.message)
        );
    }
};

// GET - Ottieni tutti i tipi (inclusi inattivi) - per admin
export const getAllExpenseTypesAdmin = async (req: Request, res: Response) => {
    try {
        const expenseTypes = await ExpenseType.find()
            .sort({ name: 1 });

        return res.status(200).json(
            ApiResponse.success('Tutti i tipi di spesa recuperati', expenseTypes)
        );
    } catch (error: any) {
        return res.status(500).json(
            ApiResponse.internalError('Errore nel recuperare i tipi di spesa', error.message)
        );
    }
};

// GET - Ottieni un tipo specifico per ID
export const getExpenseTypeById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const expenseType = await ExpenseType.findById(id);

        if (!expenseType) {
            return res.status(404).json(
                ApiResponse.notFound('Tipo di spesa non trovato')
            );
        }

        return res.status(200).json(
            ApiResponse.success('Tipo di spesa trovato', expenseType)
        );
    } catch (error: any) {
        return res.status(500).json(
            ApiResponse.internalError('Errore nel recuperare il tipo di spesa', error.message)
        );
    }
};