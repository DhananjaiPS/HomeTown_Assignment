const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submission.controller');
const validate = require('../middlewares/validate.middleware');
const { protect, authorizeRoles: authorize } = require('../middlewares/auth.middleware');
const { submitAssignmentSchema } = require('../validators/submission.validator');

router.use(protect);

router.post('/', validate(submitAssignmentSchema), submissionController.submitAssignment);
router.get('/me', submissionController.getMySubmissions);

// Admin
router.get('/admin', authorize('admin'), submissionController.getAllSubmissions);

module.exports = router;
