import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { ApiResponse } from '../helpers/ApiResponse';
import { get } from 'lodash';

// Estendi i tipi di Express per includere proprietà personalizzate
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        surname: string;
      };
      identity?: any; // Manteniamo per compatibilità
    }
    interface Session {
      userId?: string;
    }
  }
}

/**
 * Middleware JWT per autenticazione
 * Verifica il token JWT nell'header Authorization: Bearer <token>
 */
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json(
        ApiResponse.unauthorized('Token di accesso richiesto')
      );
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json(
        ApiResponse.internalError('Errore di configurazione server')
      );
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Verifica che l'utente esista ancora
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json(
        ApiResponse.unauthorized('Utente non trovato')
      );
    }

    // Aggiungi i dati dell'utente alla richiesta per i middleware successivi
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      surname: user.surname
    };

    // Manteniamo compatibilità con il vecchio sistema
    req.identity = user;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json(
        ApiResponse.unauthorized('Token scaduto')
      );
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json(
        ApiResponse.unauthorized('Token non valido')
      );
    }
    return res.status(500).json(
      ApiResponse.internalError('Errore durante la verifica del token')
    );
  }
};

/**
 * Alias per verifyToken per compatibilità
 */
export const isAuthenticated = verifyToken;

/**
 * Middleware per verificare la proprietà delle risorse
 * L'utente può accedere solo ai propri dati
 */
export const isOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const { id } = req.params;
      const currentUserId = req.user?.id;

      if (!currentUserId) {
        return res.status(403).json(
          ApiResponse.forbidden('Utente non identificato')
        );
      }

      if (currentUserId.toString() !== id) {
        return res.status(403).json(
          ApiResponse.forbidden('Accesso negato - puoi accedere solo ai tuoi dati')
        );
      }

      next();
  } catch (error) {
      console.log('Errore in isOwner:', error);
      return res.status(400).json(
        ApiResponse.internalError('Errore durante la verifica dei permessi')
      );
  }
};

/**
 * Middleware per verificare i ruoli degli utenti
 */
export const hasRole = (requiredRole: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user || req.identity;
      
      if (!user) {
        return res.status(403).json(
          ApiResponse.forbidden('Utente non autenticato')
        );
      }

      // Se il modello User ha un campo 'role', controllalo
      if (user.role !== requiredRole) {
        return res.status(403).json(
          ApiResponse.forbidden(`Accesso negato - ruolo '${requiredRole}' richiesto`)
        );
      }

      next();
    } catch (error) {
      console.log('Errore in hasRole:', error);
      return res.status(400).json(
        ApiResponse.internalError('Errore durante la verifica del ruolo')
      );
    }
  };
};

// Middleware per verificare se l'utente è un admin
export const isAdmin = hasRole('admin');

// Middleware combinato: autentica E verifica la proprietà
export const authenticateAndOwn = [isAuthenticated, isOwner];

/**
 * Middleware per ottenere le informazioni dell'utente dal token (endpoint protetto)
 */
export const getMe = (req: Request, res: Response) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json(
      ApiResponse.unauthorized('Utente non autenticato')
    );
  }

  return res.status(200).json(
    ApiResponse.success('Informazioni utente recuperate', user)
  );
};

