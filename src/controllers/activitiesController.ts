import { Request, Response } from 'express';
import { Activity } from "../models/activity";
import { ApiResponse } from "../helpers/ApiResponse";

export const getByIdAsync = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const activity = await Activity.findById(id);

        if (!activity) {
            return res.status(404).json(
                ApiResponse.notFound('Attività non trovata')
            );
        }

        return res.status(200).json(
            ApiResponse.success('Attività trovata', activity)
        );
    } catch (error: any) {
        return res.status(500).json(
            ApiResponse.internalError('Errore nel recupero delle attività', error.message)
        );
    }
};

export const getByUserIdAsync = async (req: Request, res: Response) => {
    try {
        // Ottieni l'ID utente dal JWT token (inserito dal middleware isAuthenticated)
        const userId = (req as any).user?.id;
        
        if (!userId) {
            return res.status(401).json(
                ApiResponse.unauthorized('Utente non autenticato')
            );
        }

        const activities = await Activity.find({ user_id: userId }).populate('user_id', 'name surname email');

        if (!activities || activities.length === 0) {
            return res.status(200).json(
                ApiResponse.success('Nessuna attività trovata per l\'utente', [])
            );
        }

        return res.status(200).json(
            ApiResponse.success('Attività trovate', activities)
        );
    } catch (error: any) {
        return res.status(500).json(
            ApiResponse.internalError('Errore nel recupero delle attività', error.message)
        );
    }
};

export const createAsync = async (req: Request, res: Response) => {
    try {
        const { name, amount, description, date, type } = req.body;
        
        // Ottieni l'ID utente dal JWT token
        const userId = (req as any).user?.id;
        
        if (!userId) {
            return res.status(401).json(
                ApiResponse.unauthorized('Utente non autenticato')
            );
        }

        // Validazione base
        if (!name || !amount || !date || !type) {
            return res.status(400).json(
                ApiResponse.validationError('Campi obbligatori mancanti: name, amount, date, type')
            );
        }

        const newActivity = new Activity({
            name,
            amount,
            description,
            date,
            type,
            user_id: userId // Usa l'ID dell'utente autenticato
        });

        const savedActivity = await newActivity.save();

        return res.status(201).json(
            ApiResponse.created('Attività creata con successo', savedActivity)
        );
    } catch (error: any) {
        return res.status(500).json(
            ApiResponse.internalError('Errore nella creazione dell\'attività', error.message)
        );
    }
};

export const updateAsync = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json(
                ApiResponse.unauthorized('Utente non autenticato')
            );
        }

        // Trova l'attività e verifica che appartenga all'utente
        const activity = await Activity.findById(id);
        if (!activity) {
            return res.status(404).json(
                ApiResponse.notFound('Attività non trovata')
            );
        }

        // Verifica che l'attività appartenga all'utente autenticato
        if (activity.user_id.toString() !== userId) {
            return res.status(403).json(
                ApiResponse.forbidden('Non puoi modificare attività di altri utenti')
            );
        }

        // Rimuovi user_id dagli aggiornamenti per sicurezza
        delete updates.user_id;

        const updatedActivity = await Activity.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        return res.status(200).json(
            ApiResponse.updated('Attività aggiornata con successo', updatedActivity)
        );
    } catch (error: any) {
        return res.status(500).json(
            ApiResponse.internalError('Errore nell\'aggiornamento dell\'attività', error.message)
        );
    }
};

export const deleteAsync = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json(
                ApiResponse.unauthorized('Utente non autenticato')
            );
        }

        // Trova l'attività e verifica che appartenga all'utente
        const activity = await Activity.findById(id);
        if (!activity) {
            return res.status(404).json(
                ApiResponse.notFound('Attività non trovata')
            );
        }

        // Verifica che l'attività appartenga all'utente autenticato
        if (activity.user_id.toString() !== userId) {
            return res.status(403).json(
                ApiResponse.forbidden('Non puoi eliminare attività di altri utenti')
            );
        }

        await Activity.findByIdAndDelete(id);

        return res.status(200).json(
            ApiResponse.deleted('Attività eliminata con successo')
        );
    } catch (error: any) {
        return res.status(500).json(
            ApiResponse.internalError('Errore nell\'eliminazione dell\'attività', error.message)
        );
    }
};
