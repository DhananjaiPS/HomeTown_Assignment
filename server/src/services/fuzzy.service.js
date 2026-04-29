const Fuse = require('fuse.js');
const natural = require('natural');
const PredefinedQA = require('../models/PredefinedQA');

class FuzzyService {
  constructor() {
    this.fuse = null;
    this.tokenizer = new natural.WordTokenizer();
    this.initFuse();
  }

  async initFuse() {
    try {
      const qas = await PredefinedQA.find({ isActive: true }).lean();
      const options = {
        includeScore: true,
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2,
        keys: [
          { name: 'question', weight: 0.5 },
          { name: 'normalizedQuestion', weight: 0.5 },
          { name: 'patterns', weight: 0.8 },
          { name: 'normalizedPatterns', weight: 0.8 },
          { name: 'tags', weight: 0.2 }
        ]
      };
      this.fuse = new Fuse(qas, options);
      console.log(`[FuzzyService] Advanced Matcher initialized with ${qas.length} entries.`);
    } catch (err) {
      console.error('[FuzzyService] Initialization failed:', err);
    }
  }

  /**
   * SDE-3 Level Normalization
   * Removes filler words and noise to focus on intent
   */
  normalize(text = '') {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\b(tell me about|explain|what is|what are|define|meaning of|mujhe batao|kya hai|kya hota hai|information about|can you tell me|do you know about)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Alias for backward compatibility if needed, but we should update callers
  normalizeString(text) {
    return this.normalize(text);
  }

  /**
   * Token Overlap Scoring
   */
  getKeywordOverlap(query, target) {
    const q1 = this.normalize(query);
    const q2 = this.normalize(target);

    if (q1 === q2) return 1;
    if (!q1 || !q2) return 0;

    const tokens1 = q1.split(' ');
    const tokens2 = q2.split(' ');

    const common = tokens1.filter(t => tokens2.includes(t));
    return common.length / Math.max(tokens1.length, tokens2.length);
  }

  async findMatch(message) {
    if (!this.fuse) await this.initFuse();
    const faqs = await PredefinedQA.find({ isActive: true }).lean();
    
    const normalizedUserQuery = this.normalize(message);
    if (!normalizedUserQuery) return null;

    // 1. Exact Normalized Match (Highest Priority)
    const exactMatch = faqs.find(faq => 
      faq.normalizedQuestion === normalizedUserQuery || 
      (faq.normalizedPatterns && faq.normalizedPatterns.some(p => p === normalizedUserQuery))
    );

    if (exactMatch) {
      this._trackUsage(exactMatch._id);
      return { answer: exactMatch.answer, matchType: 'predefined_exact', confidence: 1.0 };
    }

    // 2. Keyword / Token Overlap Match
    let keywordBest = null;
    for (const faq of faqs) {
      const score = this.getKeywordOverlap(message, faq.question);
      if (!keywordBest || score > keywordBest.score) {
        keywordBest = { faq, score };
      }
    }

    if (keywordBest && keywordBest.score >= 0.7) {
      this._trackUsage(keywordBest.faq._id);
      return { answer: keywordBest.faq.answer, matchType: 'predefined_keyword', confidence: keywordBest.score };
    }

    // 3. Fuse.js Fuzzy Match
    if (this.fuse) {
      const results = this.fuse.search(message);
      if (results.length > 0) {
        const best = results[0];
        const confidence = 1 - best.score;

        if (confidence >= 0.7) {
          this._trackUsage(best.item._id);
          return { answer: best.item.answer, matchType: 'predefined_fuzzy', confidence };
        }
      }
    }

    // 4. Natural Jaro-Winkler Similarity (Good for typos)
    let naturalBest = null;
    for (const faq of faqs) {
      const score = natural.JaroWinklerDistance(
        normalizedUserQuery,
        faq.normalizedQuestion
      );
      if (!naturalBest || score > naturalBest.score) {
        naturalBest = { faq, score };
      }
    }

    if (naturalBest && naturalBest.score >= 0.85) {
      this._trackUsage(naturalBest.faq._id);
      return { answer: naturalBest.faq.answer, matchType: 'predefined_natural', confidence: naturalBest.score };
    }

    return null;
  }

  _trackUsage(id) {
    PredefinedQA.findByIdAndUpdate(id, { $inc: { usageCount: 1 } }).exec().catch(() => {});
  }

  async reload() {
    await this.initFuse();
  }
}

module.exports = new FuzzyService();
