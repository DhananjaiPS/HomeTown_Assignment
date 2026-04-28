const submissionService = require('../services/submission.service');
const { sendResponse } = require('../utils/apiResponse');

exports.submitAssignment = async (req, res, next) => {
  try {
    const data = await submissionService.submitAssignment(req.user._id, req.body);
    sendResponse(res, 201, 'Assignment submitted successfully', data);
  } catch (error) {
    if (error.message === 'Assignment not found or inactive' || error.message === 'Max attempts reached') {
      res.status(400);
    }
    next(error);
  }
};

exports.getMySubmissions = async (req, res, next) => {
  try {
    const data = await submissionService.getMySubmissions(req.user._id, req.query);
    sendResponse(res, 200, 'Submissions fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.getAllSubmissions = async (req, res, next) => {
  try {
    const data = await submissionService.getAllSubmissions(req.query);
    sendResponse(res, 200, 'All submissions fetched successfully', data);
  } catch (error) {
    next(error);
  }
};
