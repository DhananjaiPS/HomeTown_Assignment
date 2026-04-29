const mongoose = require('mongoose');

const aiUsageLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  feature: { type: String, enum: ['summarize', 'hint', 'evaluate', 'evaluation', 'chat', 'viva'], required: true },
  model: { type: String, required: true },
  inputTokens: { type: Number },
  outputTokens: { type: Number },
  success: { type: Boolean, required: true },
  errorMessage: { type: String }
}, { timestamps: true });

// Indexes
aiUsageLogSchema.index({ userId: 1, createdAt: -1 });
aiUsageLogSchema.index({ feature: 1, createdAt: -1 });

module.exports = mongoose.model('AIUsageLog', aiUsageLogSchema);
