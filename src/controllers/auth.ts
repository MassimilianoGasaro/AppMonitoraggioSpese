import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { User } from '../models/user';

export const login = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('auth0', {
        scope: 'openid email profile'
    })(req, res, next);
};

export const callback = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('auth0', (err: any, user: Express.User, info: any) => {
        if (err) { return next(err); }
        if (!user) { return res.redirect('/login'); }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            return res.redirect('/dashboard');
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
