import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    options: {
      type: [String],
      validate: [(v) => v.length >= 2 && v.length <= 6, 'Each question needs 2 to 6 options'],
    },
    correctIndex: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    category: { type: String, trim: true, default: 'General' },
    timeLimit: { type: Number, min: 0, default: 10 }, // minutes, 0 = untimed
    questions: { type: [questionSchema], validate: [(v) => v.length > 0, 'Add at least one question'] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Quiz', quizSchema);
