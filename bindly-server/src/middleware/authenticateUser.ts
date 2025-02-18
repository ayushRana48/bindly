import { Request, Response, NextFunction } from 'express';
import { supabase } from 'initSupabase';
import jwt from 'jsonwebtoken';

// Extend the Request interface to include the `user` property
declare global {
  namespace Express {
    interface Request {
      user?: any; // Replace `any` with the actual user type from Supabase
    }
  }
}

const ACCESS_TOKEN_SECRET = '^O9w:&C_ci1Wo5~8y@V1Hz$=p)v-{s#y;9-?c<f==q:!y"aeuU0*R.`QQCgxf&j'; // Replace with env variable

export function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  console.log('authHeader in authenticateUser', authHeader);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('token in authenticateUser', token);
  try {
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as { id: string; email: string; username: string };
      console.log('decoded in authenticateUser', decoded);
      req.user = decoded; // Attach the decoded user data to the request object
      next();
  } catch (error) {
    console.log('error in authenticateUser', error);
      return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
  }
}