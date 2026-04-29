const mongoose = require('mongoose');

const authorRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNote: String,
  reviewedAt: Date
}, { 
  timestamps: true,
  collection: 'author_requests' // Force explicit collection name
});

// Ensure one pending request per user at a time
authorRequestSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('AuthorRequest', authorRequestSchema);
