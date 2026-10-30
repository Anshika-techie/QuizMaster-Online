import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Log in to continue' });

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(401).json({ message: 'Account not found. Log in again' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Your session expired. Log in again' });
  }
});

export const requireRole = (role) => (req, res, next) =>
  req.user.role === role ? next() : res.status(403).json({ message: 'You cannot do this with your account type' });
