import { Router } from 'express';
import mongoose from 'mongoose';
import Quiz from '../models/Quiz.js';
import Result from '../models/Result.js';
import { asyncHandler, protect, requireRole } from '../middleware/auth.js';

const router = Router();

const summary = (r) => ({
  _id: r._id,
  quizTitle: r.quizTitle,
  category: r.category,
  studentName: r.userName,
  score: r.score,
  total: r.total,
  percentage: r.percentage,
  timeTaken: r.timeTaken,
  createdAt: r.createdAt,
});

// Students see their own attempts, instructors see attempts on their quizzes
router.get(
  '/mine',
  protect,
  asyncHandler(async (req, res) => {
    const filter = req.user.role === 'instructor' ? { instructor: req.user._id } : { user: req.user._id };
    const results = await Result.find(filter).sort({ createdAt: -1 }).select('-review').lean();
    res.json(results.map(summary));
  })
);

// Automatic scoring happens here, on the server
router.post(
  '/:quizId/submit',
  protect,
  requireRole('student'),
  asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    if (!mongoose.isValidObjectId(quizId)) return res.status(404).json({ message: 'Quiz not found' });
    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const submitted = Array.isArray(req.body.answers) ? req.body.answers : [];
    const review = quiz.questions.map((q, i) => {
      const pick = submitted[i];
      const selected = Number.isInteger(pick) && pick >= 0 && pick < q.options.length ? pick : -1;
      return { text: q.text, options: q.options, selected, correctIndex: q.correctIndex };
    });

    const score = review.filter((r) => r.selected === r.correctIndex).length;
    const total = review.length;
    const timeTaken = Math.max(0, Math.round(Number(req.body.timeTaken) || 0));

    const result = await Result.create({
      user: req.user._id,
      userName: req.user.name,
      quiz: quiz._id,
      instructor: quiz.createdBy,
      quizTitle: quiz.title,
      category: quiz.category,
      score,
      total,
      percentage: Math.round((score / total) * 100),
      timeTaken,
      review,
    });

    res.status(201).json(result);
  })
);

router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Result not found' });
    const result = await Result.findById(req.params.id).lean();
    if (!result) return res.status(404).json({ message: 'Result not found' });

    const isOwner = String(result.user) === String(req.user._id);
    const isInstructor = String(result.instructor) === String(req.user._id);
    if (!isOwner && !isInstructor) return res.status(403).json({ message: 'This result belongs to someone else' });
    res.json(result);
  })
);

export default router;
