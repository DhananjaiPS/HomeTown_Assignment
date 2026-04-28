const leaderboardService = require('../services/leaderboard.service');
const { sendResponse } = require('../utils/apiResponse');

exports.getLeaderboard = async (req, res, next) => {
  try {
    const data = await leaderboardService.getLeaderboard(req.query);
    sendResponse(res, 200, 'Leaderboard fetched successfully', data);
  } catch (error) {
    next(error);
  }
};
