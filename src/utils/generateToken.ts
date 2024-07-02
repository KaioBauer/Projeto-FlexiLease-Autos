import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || '123';

export const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: '12h' });
};
