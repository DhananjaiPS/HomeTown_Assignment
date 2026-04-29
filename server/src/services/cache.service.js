const { LRUCache } = require('lru-cache');

class CacheService {
  constructor() {
    // General cache for AI chat responses
    this.chatCache = new LRUCache({
      max: 500, // Maximum number of items
      ttl: 1000 * 60 * 60 * 6, // 6 hours TTL
    });

    // Cache for article summaries
    this.summaryCache = new LRUCache({
      max: 100,
      ttl: 1000 * 60 * 60 * 24, // 24 hours TTL
    });
  }

  getChatKey(normalizedQuestion, articleId = 'global', mode = 'normal') {
    return `ai_chat:${mode}:${articleId}:${normalizedQuestion}`;
  }

  getChatAnswer(key) {
    return this.chatCache.get(key);
  }

  setChatAnswer(key, answer, ttlMs = null) {
    if (ttlMs) {
      this.chatCache.set(key, answer, { ttl: ttlMs });
    } else {
      this.chatCache.set(key, answer);
    }
  }

  getSummary(articleId) {
    return this.summaryCache.get(articleId.toString());
  }

  setSummary(articleId, summaryData) {
    this.summaryCache.set(articleId.toString(), summaryData);
  }
}

module.exports = new CacheService();
