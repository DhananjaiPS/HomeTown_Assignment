const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

class EmbeddingService {
  constructor() {
    this.hasKey = !!env.GEMINI_API_KEY;
    if (this.hasKey) {
      this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      // gemini-embedding-001 is the standard model in 2026 for general purpose embeddings
      this.model = this.genAI.getGenerativeModel({ model: "gemini-embedding-001" }, { apiVersion: 'v1beta' });
    }
  }

  /**
   * Get vector embedding for a chunk of text
   */
  async getEmbedding(text) {
    if (!this.hasKey) {
      // Mock embedding for development without API key
      return Array.from({ length: 768 }, () => Math.random() - 0.5);
    }

    try {
      const result = await this.model.embedContent(text);
      return result.embedding.values;
    } catch (err) {
      console.warn('[EmbeddingService] Primary model failed, trying fallback (embedding-001)...');
      try {
        const fallbackModel = this.genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        const result = await fallbackModel.embedContent(text);
        return result.embedding.values;
      } catch (fallbackErr) {
        console.error('[EmbeddingService] Both primary and fallback models failed.');
        throw fallbackErr;
      }
    }
  }

  /**
   * Simple chunking strategy for long articles
   */
  chunkText(text, maxChunkSize = 1000) {
    if (!text) return [];
    
    // Split by paragraphs first
    const paragraphs = text.split(/\n\s*\n/);
    const chunks = [];
    let currentChunk = "";

    for (const p of paragraphs) {
      if ((currentChunk.length + p.length) > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }
      currentChunk += p + "\n\n";
    }

    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }
}

module.exports = new EmbeddingService();
