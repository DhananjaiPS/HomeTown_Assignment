const assignmentService = require('../services/assignment.service');
const { sendResponse } = require('../utils/apiResponse');

exports.getAllAssignmentsAdmin = async (req, res, next) => {
  try {
    const data = await assignmentService.getAllAssignmentsAdmin(req.user._id, req.user.role);
    sendResponse(res, 200, 'Assignments fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.getAssignmentById = async (req, res, next) => {
  try {
    const data = await assignmentService.getAssignmentById(req.params.id);
    sendResponse(res, 200, 'Assignment fetched successfully', data);
  } catch (error) {
    if (error.message === 'Assignment not found') res.status(404);
    next(error);
  }
};

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
    const data = await assignmentService.createAssignment(req.body, req.user._id);
    sendResponse(res, 201, 'Assignment created successfully', data);
  } catch (error) {
    if (error.message === 'Article not found') {
      res.status(404);
    } else if (error.message === 'Assignment already exists for this article') {
      res.status(409);
    }
    next(error);
  }
};

exports.updateAssignment = async (req, res, next) => {
  try {
    const data = await assignmentService.updateAssignment(req.params.id, req.body, req.user._id, req.user.role);
    sendResponse(res, 200, 'Assignment updated successfully', data);
  } catch (error) {
    if (error.message === 'Assignment not found' || error.message === 'Not authorized to update this assignment') {
      res.status(error.message === 'Assignment not found' ? 404 : 403);
    }
    next(error);
  }
};

exports.deleteAssignment = async (req, res, next) => {
  try {
    const data = await assignmentService.deleteAssignment(req.params.id, req.user._id, req.user.role);
    sendResponse(res, 200, 'Assignment deleted successfully', data);
  } catch (error) {
    if (error.message === 'Assignment not found' || error.message === 'Not authorized to delete this assignment') {
      res.status(error.message === 'Assignment not found' ? 404 : 403);
    }
    next(error);
  }
};
