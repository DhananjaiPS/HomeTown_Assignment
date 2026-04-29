const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');
const validate = require('../middlewares/validate.middleware');
const protect = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const { createAssignmentSchema, updateAssignmentSchema } = require('../validators/assignment.validator');

router.use(protect);

router.get('/article/:articleId', assignmentController.getAssignmentByArticle);

// Admin & Author routes
router.get('/admin', authorize('admin', 'author'), assignmentController.getAllAssignmentsAdmin);
router.get('/:id', authorize('admin', 'author'), assignmentController.getAssignmentById);
router.post('/', authorize('admin', 'author'), validate(createAssignmentSchema), assignmentController.createAssignment);
router.put('/:id', authorize('admin', 'author'), validate(updateAssignmentSchema), assignmentController.updateAssignment);
router.delete('/:id', authorize('admin', 'author'), assignmentController.deleteAssignment);

module.exports = router;
