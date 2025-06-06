const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

module.exports = {
  authenticate: async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const decoded = jwt.verify(token, JWT_SECRET);
      const [users] = await pool.execute(
        'SELECT id, uuid, email, phone, first_name, last_name, language_pref, theme_pref FROM users WHERE id = ?',
        [decoded.userId]
      );
      
      if (users.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      //req.user = users[0];
req.user = {
  userId: users[0].id,
  ...users[0],
};
      req.db = req.db; // Attach db to request
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      res.status(401).json({ error: 'Invalid token' });
    }
  },

  authorize: (roles = []) => {
    return async (req, res, next) => {
      try {
        // In a real app, you'd check user roles against the required roles
        // For simplicity, we'll just check if user is authenticated
        if (!req.user) {
          return res.status(403).json({ error: 'Forbidden' });
        }
        next();
      } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  }
};