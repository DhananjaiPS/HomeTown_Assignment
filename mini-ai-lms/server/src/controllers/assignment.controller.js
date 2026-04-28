const assignmentService = require('../services/assignment.service');
const { sendResponse } = require('../utils/apiResponse');

exports.getAssignmentByArticle = async (req, res, next) => {
  try {
    const data = await assignmentService.getAssignmentByArticle(req.params.articleId);
    sendResponse(res, 200, 'Assignment fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.createAssignment = async (req, res, next) => {
  try {
    const data = await assignmentService.createAssignment(req.body);
    sendResponse(res, 201, 'Assignment created successfully', data);
  } catch (error) {
    if (error.message === 'Article not found' || error.message === 'Assignment already exists for this article') {
      res.status(400);
    }
    next(error);
  }
};

exports.updateAssignment = async (req, res, next) => {
  try {
    const data = await assignmentService.updateAssignment(req.params.id, req.body);
    sendResponse(res, 200, 'Assignment updated successfully', data);
  } catch (error) {
    if (error.message === 'Assignment not found') res.status(404);
    next(error);
  }
};

exports.deleteAssignment = async (req, res, next) => {
  try {
    const data = await assignmentService.deleteAssignment(req.params.id);
    sendResponse(res, 200, 'Assignment deleted successfully', data);
  } catch (error) {
    if (error.message === 'Assignment not found') res.status(404);
    next(error);
  }
};
