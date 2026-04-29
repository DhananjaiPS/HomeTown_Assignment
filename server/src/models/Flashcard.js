const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  nextReviewAt: { type: Date, default: Date.now },
  reviewCount: { type: Number, default: 0 },
  confidenceLevel: { type: Number, default: 0 }, // 0 to 100
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' } // Optional link to source
}, { timestamps: true });

flashcardSchema.index({ userId: 1, nextReviewAt: 1 });

module.exports = mongoose.model('Flashcard', flashcardSchema);
