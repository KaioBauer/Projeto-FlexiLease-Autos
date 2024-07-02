// src/middleware/authenticateToken.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '123';

interface JwtPayload {
  id: string;
}

interface CustomRequest extends Request {
  user?: JwtPayload;
}

export const authenticateToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Assume format "Bearer TOKEN"

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token.' });
    }
    req.user = decoded as JwtPayload; // Attach user payload to request
    next(); // Correctly move to the next middleware/function
  });
};
