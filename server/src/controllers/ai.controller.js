const aiService = require('../services/ai.service');
const { sendResponse } = require('../utils/apiResponse');

exports.getHint = async (req, res, next) => {
  try {
    const hint = await aiService.generateHint(req.user._id, req.body.questionText);
    sendResponse(res, 200, 'Hint generated successfully', { hint });
  } catch (error) {
    next(error);
  }
};
