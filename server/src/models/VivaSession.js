const mongoose = require('mongoose');

const vivaSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  questionsAsked: { type: Number, default: 0 },
  maxQuestions: { type: Number, default: 5 },
  status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
  score: { type: Number, default: 0 }, // Total score out of maxQuestions * 10
  history: [{
    question: String,
    userAnswer: String,
    evaluation: String, // Gemini's feedback
    marksAwarded: Number // Out of 10
  }],
  weakAreasIdentified: [String]
}, { timestamps: true });

module.exports = mongoose.model('VivaSession', vivaSessionSchema);
