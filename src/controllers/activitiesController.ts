import { Request, Response } from 'express';
import { Activity } from "../models/activity";
import { ApiResponse } from "../helpers/apiResponse";

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

        // Parametri di paginazione dalla query string
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        // Parametri di filtro opzionali
        const { type, startDate, endDate, search } = req.query;

        // Costruisci il filtro base
        let filter: any = { user_id: userId };

        // Aggiungi filtri opzionali
        if (type) {
            filter.type = type;
        }

        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = startDate;
            if (endDate) filter.date.$lte = endDate;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Esegui la query con paginazione
        const [activities, totalCount] = await Promise.all([
            Activity.find(filter)
                .populate('user_id', 'name surname email')
                .populate('type', 'name description icon color type')
                .sort({ date: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Activity.countDocuments(filter)
        ]);

        // Calcola metadati di paginazione
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        const pagination = {
            currentPage: page,
            totalPages,
            totalItems: totalCount,
            itemsPerPage: limit,
            hasNextPage,
            hasPrevPage,
            nextPage: hasNextPage ? page + 1 : null,
            prevPage: hasPrevPage ? page - 1 : null
        };

        return res.status(200).json(
            ApiResponse.success('Attività trovate', {
                activities,
                pagination
            })
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

export const getAllByUserIdAsync = async (req: Request, res: Response) => {
    try {
        // Endpoint per ottenere TUTTE le attività senza paginazione (usa con cautela)
        const userId = (req as any).user?.id;
        
        if (!userId) {
            return res.status(401).json(
                ApiResponse.unauthorized('Utente non autenticato')
            );
        }

        const activities = await Activity.findByUserWithFullDetails(userId);

        return res.status(200).json(
            ApiResponse.success('Tutte le attività trovate', activities)
        );
    } catch (error: any) {
        return res.status(500).json(
            ApiResponse.internalError('Errore nel recupero di tutte le attività', error.message)
        );
    }
};

export const getUserStatsAsync = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        
        if (!userId) {
            return res.status(401).json(
                ApiResponse.unauthorized('Utente non autenticato')
            );
        }

        const stats = await Activity.getUserStats(userId);

        return res.status(200).json(
            ApiResponse.success('Statistiche utente calcolate', stats)
        );
    } catch (error: any) {
        return res.status(500).json(
            ApiResponse.internalError('Errore nel calcolo delle statistiche', error.message)
        );
    }
};
