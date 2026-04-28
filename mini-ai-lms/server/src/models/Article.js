const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  tags: [{ type: String }],
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  readingTimeMinutes: { type: Number, default: 5 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  aiSummaryCache: {
    simpleSummary: { type: String },
    model: { type: String },
    generatedAt: { type: Date }
  }
}, { timestamps: true });

// Indexes (slug is already indexed via unique: true)
articleSchema.index({ title: 'text', content: 'text' });
articleSchema.index({ tags: 1 });
articleSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Article', articleSchema);
