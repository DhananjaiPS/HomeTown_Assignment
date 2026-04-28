const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
};

module.exports = generateToken;
