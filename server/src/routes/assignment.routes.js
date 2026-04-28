const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');
const validate = require('../middlewares/validate.middleware');
const protect = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const { createAssignmentSchema, updateAssignmentSchema } = require('../validators/assignment.validator');

router.use(protect);

router.get('/article/:articleId', assignmentController.getAssignmentByArticle);

// Admin only routes
router.get('/admin', authorize('admin'), assignmentController.getAllAssignmentsAdmin);
router.get('/:id', authorize('admin'), assignmentController.getAssignmentById);
router.post('/', authorize('admin'), validate(createAssignmentSchema), assignmentController.createAssignment);
router.put('/:id', authorize('admin'), validate(updateAssignmentSchema), assignmentController.updateAssignment);
router.delete('/:id', authorize('admin'), assignmentController.deleteAssignment);

module.exports = router;
