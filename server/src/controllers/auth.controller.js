const authService = require('../services/auth.service');
const { sendResponse } = require('../utils/apiResponse');

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const data = await authService.signup(name, email, password);
    sendResponse(res, 201, 'User registered successfully', data);
  } catch (error) {
    if (error.message === 'User already exists') {
      res.status(400);
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    sendResponse(res, 200, 'User logged in successfully', data);
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      res.status(401);
    }
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const data = await authService.getMe(req.user._id);
    sendResponse(res, 200, 'User fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  // In a stateless JWT setup, logout is handled on the client by destroying the token.
  // We just return success.
  sendResponse(res, 200, 'Logged out successfully');
};
