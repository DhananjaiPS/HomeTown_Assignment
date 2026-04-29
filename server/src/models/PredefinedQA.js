const mongoose = require('mongoose');

const predefinedQASchema = new mongoose.Schema({
  intent: { type: String, unique: true }, // unique key for this QA pair
  question: { type: String, required: true },
  normalizedQuestion: { type: String, required: true }, // lowercase, no filler words
  patterns: [{ type: String }], // raw alternative phrasings
  normalizedPatterns: [{ type: String }], // normalized alternative phrasings for matching
  answer: { type: String, required: true },
  category: { type: String, default: 'general' },
  tags: [{ type: String }],
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  usageCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

predefinedQASchema.index({ normalizedQuestion: 1 });
predefinedQASchema.index({ tags: 1 });

module.exports = mongoose.model('PredefinedQA', predefinedQASchema);
