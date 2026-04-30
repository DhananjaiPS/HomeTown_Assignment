const express = require('express');
const { protect, authorizeRoles } = require('../middlewares/auth.middleware');
const authorRequestController = require('../controllers/author-request.controller');

const router = express.Router();

router.use(protect);

// Learner Routes
router.post('/', authorRequestController.createRequest);
router.get('/my', authorRequestController.getMyRequest);

// Admin Routes
router.get('/all', authorizeRoles('admin'), authorRequestController.getAllRequests);
router.patch('/:id', authorizeRoles('admin'), authorRequestController.updateRequest);

module.exports = router;
