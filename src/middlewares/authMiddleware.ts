import { Request, Response, NextFunction } from 'express';
import { getUserBySessionToken } from '../models/user';
import { get, merge } from 'lodash';

// Estendi i tipi di Express per includere proprietà personalizzate
declare global {
  namespace Express {
    interface Request {
      identity?: any;
    }
    interface Session {
      userId?: string;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log(req.session);
  // Controlla se esiste una sessione attiva
  if (req.session && (req.session as any).userId) {
    next();
  } else {
    res.status(401).json({ 
      success: false,
      message: 'Non autorizzato - sessione richiesta' 
    });
  }
};

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const sessionToken = req.cookies["connect.sid"];
      if (!sessionToken) {
        return res.status(403).json({ 
          success: false, 
          message: 'Token di sessione mancante' 
        });
      }

      const existingUser = await getUserBySessionToken(sessionToken);
      if (!existingUser) {
        return res.status(403).json({ 
          success: false, 
          message: 'Sessione non valida' 
        });
      }

      merge(req, { identity: existingUser });
      return next();
  } catch (error) {
      console.log('Errore in isAuthenticated:', error);
      return res.status(400).json({ 
        success: false, 
        message: 'Errore durante la verifica dell\'autenticazione' 
      });
  }
};

export const isOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const { id } = req.params;
      const currentUserId = get(req, "identity._id") as unknown as string;

      if (!currentUserId) {
        return res.status(403).json({ 
          success: false, 
          message: 'Utente non identificato' 
        });
      }

      if (currentUserId.toString() !== id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Accesso negato - puoi accedere solo ai tuoi dati' 
        });
      }

      next();
  } catch (error) {
      console.log('Errore in isOwner:', error);
      return res.status(400).json({ 
        success: false, 
        message: 'Errore durante la verifica dei permessi' 
      });
  }
};

export const hasRole = (requiredRole: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = get(req, "identity");
      
      if (!user) {
        return res.status(403).json({ 
          success: false, 
          message: 'Utente non autenticato' 
        });
      }

      // Se il modello User ha un campo 'role', controllalo
      if (user.role !== requiredRole) {
        return res.status(403).json({ 
          success: false, 
          message: `Accesso negato - ruolo '${requiredRole}' richiesto` 
        });
      }

      next();
    } catch (error) {
      console.log('Errore in hasRole:', error);
      return res.status(400).json({ 
        success: false, 
        message: 'Errore durante la verifica del ruolo' 
      });
    }
  };
};

// Middleware per verificare se l'utente è un admin
export const isAdmin = hasRole('admin');

// Middleware combinato: autentica E verifica la proprietà
export const authenticateAndOwn = [isAuthenticated, isOwner];

