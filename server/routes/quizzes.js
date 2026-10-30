import { Router } from 'express';
import mongoose from 'mongoose';
import Quiz from '../models/Quiz.js';
import Result from '../models/Result.js';
import { asyncHandler, protect, requireRole } from '../middleware/auth.js';

const router = Router();

function validateQuiz(body) {
  const { title, questions } = body;
  if (!title?.trim()) return 'Give the quiz a title';
  if (!Array.isArray(questions) || questions.length === 0) return 'Add at least one question';
  for (const [i, q] of questions.entries()) {
    const n = i + 1;
    if (!q.text?.trim()) return `Question ${n} has no text`;
    if (!Array.isArray(q.options) || q.options.length < 2) return `Question ${n} needs at least 2 options`;
    if (q.options.some((o) => !String(o).trim())) return `Question ${n} has an empty option`;
    if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
      return `Pick the correct answer for question ${n}`;
    }
  }
  return null;
}

// List all quizzes (questions are not included in this payload)
router.get(
  '/',
  protect,
  asyncHandler(async (_req, res) => {
    const quizzes = await Quiz.find().sort({ createdAt: -1 }).populate('createdBy', 'name').lean();
    res.json(
      quizzes.map((q) => ({
        _id: q._id,
        title: q.title,
        description: q.description,
        category: q.category,
        timeLimit: q.timeLimit,
        questionCount: q.questions.length,
        author: q.createdBy?.name || 'Unknown',
        authorId: q.createdBy?._id,
        createdAt: q.createdAt,
      }))
    );
  })
);

// One quiz for taking: correct answers are never sent to the browser
router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Quiz not found' });
    const quiz = await Quiz.findById(req.params.id).lean();
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    res.json({
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      timeLimit: quiz.timeLimit,
      questions: quiz.questions.map(({ text, options }) => ({ text, options })),
    });
  })
);

router.post(
  '/',
  protect,
  requireRole('instructor'),
  asyncHandler(async (req, res) => {
    const problem = validateQuiz(req.body);
    if (problem) return res.status(400).json({ message: problem });

    const { title, description, category, timeLimit, questions } = req.body;
    const quiz = await Quiz.create({
      title,
      description,
      category: category?.trim() || 'General',
      timeLimit: Math.max(0, Number(timeLimit) || 0),
      questions: questions.map((q) => ({
        text: q.text.trim(),
        options: q.options.map((o) => String(o).trim()),
        correctIndex: q.correctIndex,
      })),
      createdBy: req.user._id,
    });
    res.status(201).json({ _id: quiz._id });
  })
);

router.delete(
  '/:id',
  protect,
  requireRole('instructor'),
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Quiz not found' });
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (String(quiz.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only delete your own quizzes' });
    }
    await Result.deleteMany({ quiz: quiz._id });
    await quiz.deleteOne();
    res.json({ ok: true });
  })
);

export default router;
