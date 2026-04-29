const mongoose = require('mongoose');

const studentLearningProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  weakTopics: [{
    topic: String,
    weight: { type: Number, default: 1 }, // increases as student gets questions wrong
    lastFailedAt: Date
  }],
  strongTopics: [{
    topic: String,
    weight: { type: Number, default: 1 } // increases as student gets questions right
  }],
  attemptedAssignments: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  lastPracticedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('StudentLearningProfile', studentLearningProfileSchema);
