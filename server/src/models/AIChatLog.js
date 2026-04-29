const mongoose = require('mongoose');

const aiChatLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  answer: { type: String, required: true },
  source: {
    type: String,
    enum: ['cache', 'predefined', 'fuzzy', 'gemini', 'rag_gemini'],
    required: true
  },
  mode: {
    type: String,
    enum: ['normal', 'hint', 'viva', 'interview', 'strict_teacher', 'code_helper'],
    default: 'normal'
  },
  confidence: { type: Number },
  usedRAG: { type: Boolean, default: false },
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
  responseTimeMs: { type: Number },
  suggestedActions: [String]
}, { timestamps: true });

aiChatLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('AIChatLog', aiChatLogSchema);
