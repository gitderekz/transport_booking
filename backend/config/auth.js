const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-strong-secret-key-here',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key-here',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS) || 10,
  
  generateToken: (payload) => {
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
  },
  
  generateRefreshToken: (payload) => {
    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN });
  },
  
  verifyToken: (token) => {
    return jwt.verify(token, this.JWT_SECRET);
  },
  
  verifyRefreshToken: (token) => {
    return jwt.verify(token, this.REFRESH_TOKEN_SECRET);
  }
};