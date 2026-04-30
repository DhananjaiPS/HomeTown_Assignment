const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect, authorizeRoles: authorize } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/me', dashboardController.getMyDashboard);
router.get('/admin', authorize('admin'), dashboardController.getAdminDashboard);

module.exports = router;
