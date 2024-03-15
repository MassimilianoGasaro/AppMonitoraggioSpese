import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/user';

export const register = async (req: Request, res: Response) => {
  const { username, password, email } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Nome utente e password richiesti' });
  }

  if (await User.findOne(username)) {
    return res.status(400).json({ message: 'Nome utente già esistente' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const now = new Date("aaaa-mm-dd-hh-mm-ss").toDateString();
  console.log(now);
  User.create({ username, password: hashedPassword, email: email, dateOfSubscribe: now });
  res.status(201).json({ message: 'Utente registrato con successo' });
};

export const login = (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Nome utente e password richiesti' });
  }

  const user = User.findOne(username);
  if (!user || !bcrypt.compareSync(password, "user.password")) {
    return res.status(401).json({ message: 'Credenziali non valide' });
  }

//   req.session.user = username;
  res.status(200).json({ message: 'Login riuscito' });
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
