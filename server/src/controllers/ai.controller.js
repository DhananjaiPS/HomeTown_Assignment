const aiService = require('../services/ai.service');
const { sendResponse } = require('../utils/apiResponse');

const Assignment = require('../models/Assignment');

exports.getHint = async (req, res, next) => {
  try {
    const { assignmentId, questionId, questionText } = req.body;

    // 1. Fetch assignment and question
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const question = assignment.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // 2. Check cache
    if (question.aiHintCache) {
      return sendResponse(res, 200, 'Hint loaded from cache', { 
        hint: question.aiHintCache,
        cached: true
      });
    }

    // 3. Generate hint via AI if not cached
    const hintResult = await aiService.generateHint(req.user._id, questionText);
    const hintText = hintResult.hint || '';

    // Only cache if it's a successful hint (not a graceful error message)
    if (!hintText.includes('⏳') && !hintText.includes('⚠️') && !hintText.toLowerCase().includes('failed')) {
      // SDE-3 Optimization: Use atomic update to avoid triggering full document validation (like missing createdBy)
      await Assignment.updateOne(
        { _id: assignmentId, 'questions._id': questionId },
        { $set: { 'questions.$.aiHintCache': hintText } }
      );
    }

    sendResponse(res, 200, 'Hint generated successfully', { 
      hint: hintText,
      cached: false,
      stats: hintResult.stats
    });
  } catch (error) {
    next(error);
  }
};

exports.chat = async (req, res, next) => {
  try {
    const { message, articleId, assignmentId, mode } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const response = await aiService.chat(userId, message, articleId, assignmentId, mode);

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (err) {
    next(err);
  }
};

exports.ingest = async (req, res, next) => {
  try {
    const { articleId } = req.body;
    const Article = require('../models/Article');
    const ragService = require('../services/rag.service');
    
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    await ragService.ingestArticle(article);

    res.status(200).json({
      success: true,
      message: 'Article successfully vectorized for RAG'
    });
  } catch (err) {
    next(err);
  }
};
