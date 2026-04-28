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
    const article = await Article.findOne({ slug }).populate('createdBy', 'name avatar');
    if (!article) {
      throw new Error('Article not found');
    }

    if (userRole === 'learner' && article.status !== 'published') {
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
    const article = await Article.findById(articleId);
    if (!article) {
      throw new Error('Article not found');
    }

    // Return cached if exists
    if (article.aiSummaryCache && article.aiSummaryCache.simpleSummary) {
      return { summary: article.aiSummaryCache.simpleSummary, cached: true };
    }

    const summary = await aiService.summarizeArticle(userId, article.content);

    // Only cache if it's a valid summary
    if (!summary.startsWith("Failed to generate summary")) {
      article.aiSummaryCache = {
        simpleSummary: summary,
        model: aiService.hasKey ? 'gemini-2.5-flash' : 'mock',
        generatedAt: Date.now()
      };
      await article.save();
    }

    await Activity.create({
        userId,
        type: 'ai_summary_used',
        title: 'Used AI Summary',
        description: `You generated an AI summary for an article.`,
        metadata: { articleId }
    });

    return { summary, cached: false };
  }
}

module.exports = new ArticleService();
