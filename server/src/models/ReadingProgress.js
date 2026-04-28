const mongoose = require('mongoose');

const readingProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
  progressPercentage: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  lastReadAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}, { timestamps: true });

// Indexes
readingProgressSchema.index({ userId: 1, articleId: 1 }, { unique: true });

module.exports = mongoose.model('ReadingProgress', readingProgressSchema);
