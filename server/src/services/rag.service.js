const VectorChunk = require('../models/VectorChunk');
const embeddingService = require('./embedding.service');

class RAGService {
  /**
   * Ingest an article and convert it into vector chunks
   */
  async ingestArticle(article) {
    // Delete existing chunks for this article
    await VectorChunk.deleteMany({ articleId: article._id });

    const chunks = embeddingService.chunkText(article.content);
    console.log(`[RAGService] Chunked article "${article.title}" into ${chunks.length} pieces.`);

    for (const chunkText of chunks) {
      if (!chunkText.trim()) continue;
      
      const embedding = await embeddingService.getEmbedding(chunkText);
      
      await VectorChunk.create({
        articleId: article._id,
        sourceType: 'article',
        content: chunkText,
        embedding: embedding,
        metadata: {
          title: article.title,
          difficulty: article.difficulty,
          tags: article.tags
        }
      });
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Retrieve most relevant chunks for a query
   * Fallback implementation if Atlas Vector Search is not configured
   */
  async retrieveContext(query, limit = 3) {
    try {
      const queryEmbedding = await embeddingService.getEmbedding(query);
      
      // In a real production environment with MongoDB Atlas, you would use:
      /*
      return await VectorChunk.aggregate([
        {
          $vectorSearch: {
            index: 'vector_index',
            path: 'embedding',
            queryVector: queryEmbedding,
            numCandidates: 100,
            limit: limit
          }
        }
      ]);
      */

      // Fallback: Fetch all chunks and calculate similarity manually
      // Note: This is terribly inefficient for large datasets, but works for an MVP
      const allChunks = await VectorChunk.find({});
      if (allChunks.length === 0) return [];

      const chunksWithScores = allChunks.map(chunk => ({
        ...chunk.toObject(),
        score: this.cosineSimilarity(queryEmbedding, chunk.embedding)
      }));

      // Sort by score descending
      chunksWithScores.sort((a, b) => b.score - a.score);

      // Return top N results above a certain threshold
      return chunksWithScores
        .filter(c => c.score > 0.6) // basic threshold
        .slice(0, limit);

    } catch (err) {
      console.error('[RAGService] Retrieval failed:', err);
      return [];
    }
  }

  async buildRAGContextString(query) {
    const relevantChunks = await this.retrieveContext(query);
    if (!relevantChunks || relevantChunks.length === 0) return '';

    let contextStr = '\n[Retrieved Context from Knowledge Base]\n';
    relevantChunks.forEach((chunk, i) => {
      contextStr += `Source ${i+1} (Article: ${chunk.metadata?.title || 'Unknown'}):\n${chunk.content}\n\n`;
    });

    return contextStr;
  }
}

module.exports = new RAGService();
