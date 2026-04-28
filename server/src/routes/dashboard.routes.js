const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const protect = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

router.use(protect);

router.get('/me', dashboardController.getMyDashboard);
router.get('/admin', authorize('admin'), dashboardController.getAdminDashboard);

module.exports = router;
