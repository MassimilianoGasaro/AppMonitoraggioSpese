import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import moment from 'moment';
import { ApiResponse } from '../helpers/ApiResponse';

export const register = async (req: Request, res: Response) => {
  const { name, surname, password, email } = req.body;
  
  if (!name || !surname || !password || !email) {
    return res.status(400).json(
      ApiResponse.validationError('Nome, cognome, password e email richiesti')
    );
  }

  try {
    const user = await User.findOne({ email: email});
    if (user) {
      return res.status(400).json(
        ApiResponse.error('Email già esistente')
      );
    }

    const formattedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    const newUser = await User.create({ 
      name, 
      surname, 
      password, 
      email, 
      dateOfSubscribe: formattedDate 
    });

    return res.status(201).json(
      ApiResponse.created('Utente registrato con successo', {
        id: newUser._id,
        name: newUser.name,
        surname: newUser.surname,
        email: newUser.email,
        dateOfSubscribe: newUser.dateOfSubscribe
      })
    );
  } catch (error: any) {
    return res.status(500).json(
      ApiResponse.internalError('Errore durante la registrazione', error.message)
    );
  }
};

export const login = async (req: Request, res: Response) => {
  const { password, email } = req.body;
  
  if (!email || !password) {
    return res.status(400).json(
      ApiResponse.validationError('Email e password richiesti')
    );
  }

  try {
    const user = await User.findOne({ email: email});
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json(
        ApiResponse.unauthorized('Credenziali non valide')
      );
    }

    // Genera JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json(
        ApiResponse.internalError('Errore di configurazione server')
      );
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
        expiresIn: '24h'
      }
    );

    // Salva il token nell'utente per il logout
    user._sessionToken = token;
    await user.save();

    return res.status(200).json(
      ApiResponse.success('Login effettuato con successo', {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          surname: user.surname
        },
        expiresIn: '24h'
      })
    );
  } catch (error: any) {
    return res.status(500).json(
      ApiResponse.internalError('Errore durante il login', error.message)
    );
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (userId) {
      // Rimuovi il token dal database (opzionale per blacklist)
      await User.findByIdAndUpdate(userId, { $unset: { _sessionToken: 1 } });
    }

    return res.status(200).json(
      ApiResponse.success('Logout effettuato con successo')
    );
  } catch (error: any) {
    return res.status(500).json(
      ApiResponse.internalError('Errore durante il logout', error.message)
    );
  }
};

export const test = (req: Request, res: Response) => {
  return res.status(200).json(
    ApiResponse.success('Test endpoint raggiunto con successo', {
      message: "API funzionante",
      timestamp: new Date().toISOString()
    })
  );
};