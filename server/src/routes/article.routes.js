const express = require('express');
const router = express.Router();
const articleController = require('../controllers/article.controller');
const validate = require('../middlewares/validate.middleware');
const protect = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const { createArticleSchema, updateArticleSchema, progressSchema } = require('../validators/article.validator');

// Public or Learner routes (requires auth for some features, but viewing can be restricted based on requirement. We will enforce auth for all.)
router.use(protect);

router.get('/', articleController.getArticles);
router.get('/:slug', articleController.getArticleBySlug);
router.get('/:id/ai-summary', articleController.getAiSummary);
router.post('/:id/progress', validate(progressSchema), articleController.updateProgress);

// Admin & Author routes
router.post('/', authorize('admin', 'author'), validate(createArticleSchema), articleController.createArticle);
router.put('/:id', authorize('admin', 'author'), validate(updateArticleSchema), articleController.updateArticle);
router.delete('/:id', authorize('admin', 'author'), articleController.deleteArticle);

module.exports = router;
