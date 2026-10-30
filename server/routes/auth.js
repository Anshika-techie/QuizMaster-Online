import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler, protect } from '../middleware/auth.js';

const router = Router();

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });
const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) return res.status(400).json({ message: 'Password needs at least 6 characters' });

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists' });

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: role === 'instructor' ? 'instructor' : 'student',
    });
    res.status(201).json({ token: sign(user), user: publicUser(user) });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password || '', user.password))) {
      return res.status(401).json({ message: 'Email or password is incorrect' });
    }
    res.json({ token: sign(user), user: publicUser(user) });
  })
);

router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));

export default router;
