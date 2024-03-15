import { Request, Response, NextFunction } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    console.log(req);
  if (req.session) {
    next();
  } else {
    res.status(401).json({ message: 'Non autorizzato' });
  }
};
