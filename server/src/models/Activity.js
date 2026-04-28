const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'article_read',
      'article_completed',
      'assignment_submitted',
      'badge_earned',
      'ai_hint_used',
      'ai_summary_used'
    ],
    required: true
  },
  title: { type: String, required: true },
  description: { type: String },
  metadata: {
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
    score: { type: Number }
  }
}, { timestamps: true });

// Indexes
activitySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
