import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import moment from 'moment';
import { ApiResponse } from '../helpers/apiResponse';
import crypto from 'crypto';
import { sendEmail } from '../config/emailConfig';

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
      // Rimuovi il token dal database
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

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json(
                ApiResponse.validationError('Email richiesta')
            );
        }

        const user = await User.findOne({ email });
        if (!user) {
            // ⚠️ Per sicurezza, non rivelare se l'email esiste o no
            return res.status(200).json(
                ApiResponse.success('Se l\'email esiste, riceverai le istruzioni per il reset')
            );
        }

        // Genera token di reset
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minuti

        // Salva token nel database
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // URL di reset (frontend)
        const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        
        // Template email
        const emailHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #007bff;">Reset Password - MoneyManager</h2>
                <p>Ciao ${user.name},</p>
                <p>Hai richiesto di reimpostare la password del tuo account.</p>
                <p>Clicca sul pulsante qui sotto per creare una nuova password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetURL}" 
                       style="background-color: #007bff; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    Questo link scadrà tra 15 minuti.<br>
                    Se non hai richiesto questo reset, ignora questa email.
                </p>
                <p style="color: #666; font-size: 12px;">
                    Se il pulsante non funziona, copia e incolla questo link nel browser:<br>
                    <a href="${resetURL}">${resetURL}</a>
                </p>
            </div>
        `;

        // Invia email
        const emailSent = await sendEmail(
            user.email,
            'Reset Password - MoneyManager App',
            emailHTML
        );

        if (!emailSent) {
            return res.status(500).json(
                ApiResponse.internalError('Errore nell\'invio dell\'email')
            );
        }

        return res.status(200).json(
            ApiResponse.success('Email di reset inviata con successo')
        );

    } catch (error: any) {
        return res.status(500).json(
            ApiResponse.internalError('Errore durante il reset password', error.message)
        );
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json(
                ApiResponse.validationError('Token e nuova password richiesti')
            );
        }

        if (newPassword.length < 6) {
            return res.status(400).json(
                ApiResponse.validationError('La password deve essere di almeno 6 caratteri')
            );
        }

        // Trova utente con token valido e non scaduto
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() } // Token non scaduto
        });

        if (!user) {
            return res.status(400).json(
                ApiResponse.error('Token non valido o scaduto')
            );
        }

        // Hash della nuova password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Aggiorna password e rimuovi token di reset
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user._sessionToken = undefined; // Invalida sessioni attive
        await user.save();

        return res.status(200).json(
            ApiResponse.success('Password aggiornata con successo')
        );

    } catch (error: any) {
        return res.status(500).json(
            ApiResponse.internalError('Errore durante l\'aggiornamento password', error.message)
        );
    }
};

export const validateResetToken = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        
        if (!token) {
            return res.status(400).json(
                ApiResponse.validationError('Token richiesto')
            );
        }

        // Verifica se il token esiste ed è valido
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json(
                ApiResponse.error('Token non valido o scaduto')
            );
        }

        return res.status(200).json(
            ApiResponse.success('Token valido', {
                email: user.email,
                name: user.name
            })
        );

    } catch (error: any) {
        return res.status(500).json(
            ApiResponse.internalError('Errore durante la validazione token', error.message)
        );
    }
};