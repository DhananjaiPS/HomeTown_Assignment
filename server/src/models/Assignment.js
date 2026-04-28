const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },

  // 1. UPDATED ENUM: Added 'msq' and 'true_false'
  type: {
    type: String,
    enum: ['mcq', 'short_answer', 'msq', 'true_false'],
    required: true
  },

  // 2. UPDATED OPTIONS: Added 'isCorrect' boolean for MCQ/MSQ/True-False
  options: [{
    label: { type: String },
    text: { type: String },
    isCorrect: { type: Boolean, default: false }
  }],

  // Note: I removed the old `correctOption: String` because your React 
  // frontend correctly uses the `isCorrect` boolean on the options array, 
  // which is required for MSQ since there are multiple correct answers!

  expectedAnswer: { type: String }, // Only for short_answer
  rubric: { type: String },         // Only for short_answer
  marks: { type: Number, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  aiHintCache: { type: String }     // Cache for AI generated hint
});

const assignmentSchema = new mongoose.Schema({
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
  title: { type: String, required: true },
  instructions: { type: String },
  questions: [questionSchema],
  totalMarks: { type: Number, required: true },
  maxAttempts: { type: Number, default: 3 },
  dueDate: { type: Date },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

// Indexes
assignmentSchema.index({ articleId: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);