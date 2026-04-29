const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'article_read',
      'article_created',
      'article_updated',
      'article_completed',
      'assignment_created',
      'assignment_updated',
      'assignment_submitted',
      'badge_earned',
      'ai_hint_used',
      'ai_summary_used',
      'session_start',
      'session_end',
      'topic_revision'
    ],
    required: true
  },
  title: { type: String, required: true },
  description: { type: String },
  durationSeconds: { type: Number }, // For Cognitive Load / Anti-Procrastination
  metadata: {
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
    score: { type: Number },
    accuracyDrop: { type: Number },
    timePerQuestion: { type: Number },
    topic: { type: String }
  }
}, { timestamps: true });

// Indexes
activitySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
