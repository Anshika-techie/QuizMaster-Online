import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB, { disconnectDB } from './config/db.js';
import User from './models/User.js';
import { seedDemo } from './seed.js';
import authRoutes from './routes/auth.js';
import quizRoutes from './routes/quizzes.js';
import resultRoutes from './routes/results.js';

// Works with zero setup. Set a real JWT_SECRET in server/.env for production.
process.env.JWT_SECRET ||= 'dev-only-secret-change-me';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/results', resultRoutes);

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  if ((await User.countDocuments()) === 0) {
    await seedDemo();
    console.log('Empty database detected: added demo accounts and sample quizzes');
  }
  const server = app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  server.on('error', (err) => {
    console.error(
      err.code === 'EADDRINUSE'
        ? `Port ${PORT} is already in use. Close the other program using it, or set PORT in server/.env`
        : err.message
    );
    process.exit(1);
  });
}

start().catch((err) => {
  console.error('Could not start the server:', err.message);
  process.exit(1);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    await disconnectDB().catch(() => {});
    process.exit(0);
  });
}
