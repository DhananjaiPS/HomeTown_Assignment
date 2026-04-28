const dashboardService = require('../services/dashboard.service');
const { sendResponse } = require('../utils/apiResponse');

exports.getMyDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getMyDashboard(req.user._id);
    sendResponse(res, 200, 'Dashboard fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.getAdminDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getAdminDashboard();
    sendResponse(res, 200, 'Admin Dashboard fetched successfully', data);
  } catch (error) {
    next(error);
  }
};
