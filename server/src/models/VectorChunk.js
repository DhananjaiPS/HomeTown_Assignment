const mongoose = require('mongoose');

const vectorChunkSchema = new mongoose.Schema({
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
  sourceType: { type: String, enum: ['article', 'assignment', 'note'], required: true },
  content: { type: String, required: true },
  embedding: { type: [Number], required: true }, // The actual vector from Gemini
  metadata: {
    title: String,
    difficulty: String,
    tags: [String]
  }
}, { timestamps: true });

// Optional: If using MongoDB Atlas Vector Search, you would create a search index on the 'embedding' field manually in the Atlas UI.
// vectorChunkSchema.index({ embedding: '2dsphere' }); // Not valid for actual high-dimensional vectors, just standard Mongo syntax. Real vector indexing is done via Atlas Search.

module.exports = mongoose.model('VectorChunk', vectorChunkSchema);
