const articleService = require('../services/article.service');
const { sendResponse } = require('../utils/apiResponse');

exports.getArticles = async (req, res, next) => {
  try {
    const data = await articleService.getArticles(req.query, req.user ? req.user.role : 'learner');
    sendResponse(res, 200, 'Articles fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.getArticleBySlug = async (req, res, next) => {
  try {
    const data = await articleService.getArticleBySlug(req.params.slug, req.user ? req.user.role : 'learner');
    sendResponse(res, 200, 'Article fetched successfully', data);
  } catch (error) {
    if (error.message === 'Article not found') res.status(404);
    next(error);
  }
};

exports.createArticle = async (req, res, next) => {
  try {
    const data = await articleService.createArticle(req.body, req.user._id);
    sendResponse(res, 201, 'Article created successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.updateArticle = async (req, res, next) => {
  try {
    const data = await articleService.updateArticle(req.params.id, req.body);
    sendResponse(res, 200, 'Article updated successfully', data);
  } catch (error) {
    if (error.message === 'Article not found') res.status(404);
    next(error);
  }
};

exports.deleteArticle = async (req, res, next) => {
  try {
    const data = await articleService.deleteArticle(req.params.id);
    sendResponse(res, 200, 'Article deleted successfully', data);
  } catch (error) {
    if (error.message === 'Article not found') res.status(404);
    next(error);
  }
};

exports.updateProgress = async (req, res, next) => {
  try {
    const data = await articleService.updateProgress(req.user._id, req.params.id, req.body);
    sendResponse(res, 200, 'Progress updated successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.getAiSummary = async (req, res, next) => {
  try {
    const data = await articleService.getAiSummary(req.params.id, req.user._id);
    sendResponse(res, 200, 'Summary generated successfully', data);
  } catch (error) {
    if (error.message === 'Article not found') res.status(404);
    next(error);
  }
};
