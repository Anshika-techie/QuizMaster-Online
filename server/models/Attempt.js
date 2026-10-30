import mongoose from 'mongoose';

// One open attempt per student per quiz. The server owns the clock, so the
// timer cannot be extended from the browser and time taken cannot be faked.
const attemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  startedAt: { type: Date, required: true },
  // Last moment a submission is accepted. MongoDB also deletes the document after this.
  expireAt: { type: Date, required: true, index: { expires: 0 } },
});

attemptSchema.index({ user: 1, quiz: 1 }, { unique: true });

export default mongoose.model('Attempt', attemptSchema);
