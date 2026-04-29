const Flashcard = require('../models/Flashcard');

class SpacedRevisionService {
  /**
   * SuperMemo-2 (SM-2) inspired algorithm for spaced repetition.
   * Quality (q): 
   * 0 - complete blackout (failed, "again")
   * 3 - correct response recalled with serious difficulty ("hard")
   * 4 - correct response after a hesitation ("good")
   * 5 - perfect response ("easy")
   */
  calculateNextReview(currentReviewCount, confidenceLevel, quality) {
    let nextIntervalDays = 1;

    if (quality < 3) {
      // Failed - reset to 1 day
      nextIntervalDays = 1;
    } else {
      if (currentReviewCount === 0) {
        nextIntervalDays = 1;
      } else if (currentReviewCount === 1) {
        nextIntervalDays = 6;
      } else {
        // Simplified exponential growth based on quality and confidence
        let easinessFactor = 2.5 + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (easinessFactor < 1.3) easinessFactor = 1.3;
        
        // Use confidence level (0-100) to slightly adjust interval
        const confidenceMultiplier = 0.8 + ((confidenceLevel / 100) * 0.4); // 0.8x to 1.2x
        
        nextIntervalDays = Math.round(currentReviewCount * easinessFactor * confidenceMultiplier);
      }
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + nextIntervalDays);
    
    return {
      nextReviewAt: nextReviewDate,
      reviewCount: quality < 3 ? 0 : currentReviewCount + 1
    };
  }

  async processReview(flashcardId, userId, qualityScore, confidenceLevel) {
    const card = await Flashcard.findOne({ _id: flashcardId, userId });
    if (!card) throw new Error('Flashcard not found');

    const { nextReviewAt, reviewCount } = this.calculateNextReview(
      card.reviewCount, 
      confidenceLevel || card.confidenceLevel, 
      qualityScore
    );

    card.nextReviewAt = nextReviewAt;
    card.reviewCount = reviewCount;
    card.confidenceLevel = confidenceLevel !== undefined ? confidenceLevel : card.confidenceLevel;
    
    await card.save();
    return card;
  }
}

module.exports = new SpacedRevisionService();
