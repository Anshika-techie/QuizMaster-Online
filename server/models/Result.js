import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    text: String,
    options: [String],
    selected: Number, // -1 means skipped
    correctIndex: Number,
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: String,
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quizTitle: String,
    category: String,
    score: Number,
    total: Number,
    percentage: Number,
    timeTaken: Number, // seconds
    review: [reviewSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Result', resultSchema);
