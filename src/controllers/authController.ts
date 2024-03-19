import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
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
  if (!user || !bcrypt.compare(password, user.password)) {
    return res.status(401).json({ message: 'Credenziali non valide' });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedCookie = bcrypt.hashSync(user._id.toString(), salt);
  res.cookie('connect.sid', hashedCookie).status(200).json({ message: 'Login riuscito' });
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

export const test = (req: Request, res: Response) => {
  console.log(req);
  res.status(200).json({ message: "test riuscito" });
};