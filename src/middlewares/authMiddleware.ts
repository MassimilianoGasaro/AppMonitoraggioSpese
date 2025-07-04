import { Request, Response, NextFunction } from 'express';
import { getUserBySessionToken } from '../models/user';
import { get, merge } from 'lodash';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.get("set-cookie")
  if (req.session) {
    next();
  } else {
    res.status(401).json({ message: 'Non autorizzato' });
  }
};

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const sessionToken = req.cookies["connect.sid"];
      if (!sessionToken) return res.sendStatus(403);

      const existingUser = getUserBySessionToken(sessionToken);
      if (!existingUser) return res.sendStatus(403);

      merge(req, { identity: existingUser });
      return next()
  } catch (error) {
      console.log(error);
      return res.sendStatus(400);
  }
};

export const isOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const { id } = req.params;
      const currentUserId = get(req, "identity._id") as unknown as string;

      if (!currentUserId) return res.sendStatus(403);
      if (currentUserId !== id) return res.sendStatus(403);

      next();
  } catch (error) {
      console.log(error);
      return res.sendStatus(400);
  }
}

