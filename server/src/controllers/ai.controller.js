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
    const hint = await aiService.generateHint(req.user._id, questionText);

    // Only cache if it's a successful hint (not a graceful error message)
    if (!hint.includes('⏳') && !hint.includes('⚠️') && !hint.toLowerCase().includes('failed')) {
      question.aiHintCache = hint;
      await assignment.save();
    }

    sendResponse(res, 200, 'Hint generated successfully', { 
      hint,
      cached: false
    });
  } catch (error) {
    next(error);
  }
};
