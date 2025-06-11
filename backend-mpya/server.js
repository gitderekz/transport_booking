require('dotenv').config();
const http = require('http');
const app = require('./app');
const { sequelize } = require('./models');

const port = process.env.PORT || 3008;
const server = http.createServer(app);

// Database synchronization options
const syncOptions = process.env.NODE_ENV === 'development' ? {
  alter: true,  // Safe for development (preserves existing data)
  // force: true // DANGEROUS - drops all tables and recreates them (for development only)
} : {};

// Handle database synchronization and server startup
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established');

    // Synchronize all models
    await sequelize.sync(syncOptions);
    console.log('Database synchronized');

    // Start server
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle SIGTERM for graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Start the application
startServer();
// ****************************************************




// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const morgan = require('morgan');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
// const { pool } = require('./config/db');

// const app = express();

// // Middleware
// app.use(helmet());
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(morgan('dev'));

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later'
// });
// app.use(limiter);

// // Routes
// const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes');
// const transportRoutes = require('./routes/transportRoutes');
// const bookingRoutes = require('./routes/bookingRoutes');

// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/transports', transportRoutes);
// app.use('/api/bookings', bookingRoutes);

// // Health check
// app.get('/api/health', async (req, res) => {
//   try {
//     await pool.execute('SELECT 1');
//     res.json({ status: 'OK', database: 'connected' });
//   } catch (error) {
//     res.status(500).json({ status: 'DOWN', database: 'disconnected' });
//   }
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ error: 'Not found' });
// });

// // Error handler
// app.use((err, req, res, next) => {
//   console.error('Server error:', err);
//   res.status(500).json({ error: 'Internal server error' });
// });

// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });