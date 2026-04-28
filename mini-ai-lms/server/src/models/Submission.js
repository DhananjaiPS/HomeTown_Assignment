const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  type: { type: String, enum: ['mcq', 'short_answer'], required: true },
  userAnswer: { type: String }, // User typed answer
  selectedOption: { type: String }, // For MCQ
  isCorrect: { type: Boolean },
  marksAwarded: { type: Number, default: 0 },
  maxMarks: { type: Number, required: true },
  aiEvaluation: {
    score: { type: Number },
    feedback: { type: String },
    improvement: { type: String },
    model: { type: String },
    evaluatedAt: { type: Date }
  }
});

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  attemptNo: { type: Number, required: true, default: 1 },
  answers: [answerSchema],
  totalScore: { type: Number, required: true, default: 0 },
  totalMaxScore: { type: Number, required: true },
  percentage: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['submitted', 'evaluated', 'failed_ai_evaluation'], default: 'submitted' },
  timeTakenSeconds: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes
submissionSchema.index({ userId: 1, createdAt: -1 });
submissionSchema.index({ assignmentId: 1 });
submissionSchema.index({ userId: 1, assignmentId: 1, attemptNo: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
