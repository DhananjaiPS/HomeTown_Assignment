const Article = require('../models/Article');
const ReadingProgress = require('../models/ReadingProgress');
const Activity = require('../models/Activity');
const aiService = require('./ai.service');

class ArticleService {
  async getArticles(query, userRole) {
    const { page, limit, skip } = require('../utils/pagination').getPagination(query);
    const filter = {};

    // Learners only see published articles
    if (userRole === 'learner') {
      filter.status = 'published';
    }

    if (query.search) {
      filter.$text = { $search: query.search };
    }
    if (query.tag) {
      filter.tags = query.tag;
    }
    if (query.difficulty) {
      filter.difficulty = query.difficulty;
    }

    const articles = await Article.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name avatar');

    const total = await Article.countDocuments(filter);

    return { articles, total, page, pages: Math.ceil(total / limit) };
  }

  async getArticleBySlug(slug, userRole) {
    console.log(`[DEBUG] getArticleBySlug called with slug: "${slug}", userRole: "${userRole}"`);
    const article = await Article.findOne({ slug }).populate('createdBy', 'name avatar');
    if (!article) {
      console.log(`[DEBUG] Article not found in DB for slug: "${slug}"`);
      throw new Error('Article not found');
    }

    if (userRole === 'learner' && article.status !== 'published') {
      console.log(`[DEBUG] Article is draft and user is learner. slug: "${slug}"`);
      throw new Error('Article not found');
    }

    return article;
  }

  async createArticle(data, userId) {
    return await Article.create({ ...data, createdBy: userId });
  }

  async updateArticle(id, data) {
    const article = await Article.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!article) {
      throw new Error('Article not found');
    }
    return article;
  }

  async deleteArticle(id) {
    const article = await Article.findByIdAndDelete(id);
    if (!article) {
      throw new Error('Article not found');
    }
    return article;
  }

  async updateProgress(userId, articleId, data) {
    let progress = await ReadingProgress.findOne({ userId, articleId });
    const isFirstTimeCompletion = data.completed && (!progress || !progress.completed);

    if (progress) {
      progress.progressPercentage = data.progressPercentage;
      progress.lastReadAt = Date.now();
      if (data.completed && !progress.completed) {
        progress.completed = true;
        progress.completedAt = Date.now();
      }
      await progress.save();
    } else {
      progress = await ReadingProgress.create({
        userId,
        articleId,
        progressPercentage: data.progressPercentage,
        completed: data.completed || false,
        completedAt: data.completed ? Date.now() : null
      });
    }

    if (isFirstTimeCompletion) {
      await Activity.create({
        userId,
        type: 'article_completed',
        title: 'Completed an Article',
        description: `You completed reading an article.`,
        metadata: { articleId }
      });
      // Updating user denormalized stats
      const User = require('../models/User');
      await User.findByIdAndUpdate(userId, { $inc: { 'stats.articlesCompleted': 1 } });
    }

    return progress;
  }

  async getAiSummary(articleId, userId) {
    console.log(`\n--- [AI SUMMARY DEBUG] START ---`);
    console.log(`1. Fetching article: ${articleId}`);

    const article = await Article.findById(articleId);
    if (!article) {
      console.log(`❌ Article not found in DB`);
      throw new Error('Article not found');
    }

    const cachedSummary = article.aiSummaryCache?.simpleSummary;
    console.log(`2. Current Cache:`, cachedSummary ? `"${cachedSummary.substring(0, 30)}..."` : `None`);

    const isInvalidCachedSummary =
      !cachedSummary ||
      cachedSummary.toLowerCase().includes('failed to generate') ||
      cachedSummary.toLowerCase().includes('please try again later');

    if (!isInvalidCachedSummary) {
      console.log(`✅ Returning VALID cached summary.`);
      console.log(`--- [AI SUMMARY DEBUG] END ---\n`);
      return { summary: cachedSummary, cached: true };
    }

    console.log(`3. Cache is empty or invalid. Calling Gemini AI...`);

    // Call the AI Service
    const result = await aiService.summarizeArticle(userId, article.content, article.title);

    console.log(`4. Gemini AI Response Received:`);
    console.log(`   - Should Cache: ${result.shouldCache}`);
    console.log(`   - Summary Text: "${result.summary.substring(0, 50)}..."`);

    if (result.shouldCache) {
      console.log(`5. Saving successful summary to database cache...`);
      article.aiSummaryCache = {
        simpleSummary: result.summary,
        model: aiService.hasKey ? 'gemini-2.5-flash' : 'mock',
        generatedAt: Date.now()
      };
      await article.save();
    } else {
      console.log(`⚠️ AI returned a fallback/error string. Not caching.`);
    }

    await Activity.create({
      userId,
      type: 'ai_summary_used',
      title: 'Used AI Summary',
      description: `You generated an AI summary for an article.`,
      metadata: { articleId }
    });

    console.log(`--- [AI SUMMARY DEBUG] END ---\n`);
    return { summary: result.summary, cached: false };
  }
}

module.exports = new ArticleService();
