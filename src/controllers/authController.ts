import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import moment from 'moment';

export const register = async (req: Request, res: Response) => {
  const { name, surname, password, email } = req.body;
  if (!name || !surname || !password || !email) return res.status(400).json({ message: 'Nome, cognome, password e email richiesti' });

  const user = await User.findOne({ email: email});
  if (user) return res.status(400).json({ message: 'Email già esistente' });

  const formattedDate = moment().format('YYYY-MM-DD HH:mm:ss');
  // password sarà automaticamente hashata dal metodo creato nel model user.ts
  User.create({ name: name, surname: surname, password: password, email: email, dateOfSubscribe: formattedDate });
  res.status(201).json({ message: 'Utente registrato con successo' });
};

export const login = async (req: Request, res: Response) => {
  const { password, email } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e password richiesti' });
  }

  const user = await User.findOne({ email: email});
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Credenziali non valide' });
  }

  // Genera JWT token
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ message: 'Errore di configurazione server' });
  }

  const token = jwt.sign(
    { 
      userId: user._id,
      email: user.email,
      name: user.name,
      surname: user.surname
    },
    jwtSecret,
    { 
      expiresIn: '24h' // Token valido per 24 ore
    }
  );

  // Salva il token nell'utente per il logout
  user._sessionToken = token;
  await user.save();

  res.status(200).json({ 
    message: 'Login riuscito',
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      surname: user.surname
    },
    expiresIn: '24h'
  });
};

export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Errore durante il logout' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logout riuscito' });
  });
};

// Middleware per verificare il JWT token
export const verifyToken = async (req: Request, res: Response, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Token di accesso richiesto' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: 'Errore di configurazione server' });
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Verifica che l'utente esista ancora
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Utente non trovato' });
    }

    // Aggiungi i dati dell'utente alla richiesta
    (req as any).user = {
      id: user._id,
      email: user.email,
      name: user.name,
      surname: user.surname
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token scaduto' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Token non valido' });
    }
    return res.status(500).json({ message: 'Errore durante la verifica del token' });
  }
};

// Funzione per ottenere le informazioni dell'utente dal token
export const getMe = (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ user });
};

export const test = (req: Request, res: Response) => {
  console.log(req);
  res.status(200).json({ message: "test riuscito" });
};