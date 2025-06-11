const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');
const { sendVerificationEmail } = require('../utils/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const SALT_ROUNDS = 10;

module.exports = {
  register: async (req, res) => {
    try {
      const { email, phone, password, firstName, lastName, gender, age, language_pref, theme_pref } = req.body;
      
      // Validate input
      if (!email && !phone) {
        return res.status(400).json({ error: 'Email or phone is required' });
      }
      if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      // Check if user exists
      const [existingUser] = await pool.execute(
        'SELECT id FROM users WHERE email = ? OR phone = ?',
        [email, phone]
      );
      
      if (existingUser.length > 0) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const verificationToken = uuidv4();

      // Create user
      const [result] = await pool.execute(
        'INSERT INTO users (uuid, email, phone, password_hash, first_name, last_name,gender,age,language_pref,theme_pref, verification_token) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [email, phone, hashedPassword, firstName, lastName, gender, age, language_pref, theme_pref, verificationToken]
      );

      // Send verification email if email exists
      if (email) {
        await sendVerificationEmail(email, verificationToken);
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: result.insertId },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.status(201).json({
        message: 'User registered successfully. Please verify your email.',
        userId: result.insertId,
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, phone, password } = req.body;
      console.log("email, phone, password ",email, phone, password );
      // Validate input
      if (!email && !phone) {
        return res.status(400).json({ error: 'Email or phone is required' });
      }

      // Find user
      const [users] = await pool.execute(
        'SELECT * FROM users WHERE email = ? OR phone = ?',
        [email ?? null, phone ?? null]
      );
      
      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = users[0];
	
      // Check password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if verified
      if (!user.is_verified) {
        return res.status(403).json({ 
          error: 'Account not verified', 
          userId: user.id,
          verificationRequired: true 
        });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Omit sensitive data from response
      const { password_hash, verification_token, ...rest } = user;

     // Normalize boolean field
     const userData = {
       ...rest,
       is_verified: Boolean(user.is_verified)
     };

      console.log('USER: ',userData);
      res.json({
        message: 'Login successful',
        user: userData,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  verifyEmail: async (req, res) => {
    try {
      const { token } = req.params;
      
      const [result] = await pool.execute(
        'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = ?',
        [token]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Invalid or expired verification token' });
      }
      
      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};