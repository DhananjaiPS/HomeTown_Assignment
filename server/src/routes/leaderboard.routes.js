const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboard.controller');
const protect = require('../middlewares/auth.middleware');

router.get('/', protect, leaderboardController.getLeaderboard);

module.exports = router;
