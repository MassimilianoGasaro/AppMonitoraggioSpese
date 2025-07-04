import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { User } from '../models/user';

export const login = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('auth0', {
        scope: 'openid email profile'
    })(req, res, next);
};

export const callback = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('auth0', (err: any, user: any, info: any) => {
        if (err) { 
            return res.status(500).json({ 
                success: false, 
                message: 'Errore durante l\'autenticazione', 
                error: err.message 
            }); 
        }
        if (!user) { 
            return res.status(401).json({ 
                success: false, 
                message: 'Autenticazione fallita' 
            }); 
        }
        req.logIn(user, (err) => {
            if (err) { 
                return res.status(500).json({ 
                    success: false, 
                    message: 'Errore durante il login', 
                    error: err.message 
                }); 
            }
            
            // Genera un token di sessione
            const sessionToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            
            return res.json({
                success: true,
                message: 'Login effettuato con successo',
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    surname: user.surname
                },
                sessionToken,
                redirectUrl: '/dashboard'
            });
        });
    })(req, res, next);
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, username } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'L\'utente esiste già' });
        }
        const newUser = new User({ email, password, username });
        await newUser.save();
        res.status(201).json({ message: 'Utente registrato con successo' });
    } catch (error) {
        next(error);
    }
};