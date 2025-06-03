const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'transport_booking',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  timezone: '+00:00',
  charset: 'utf8mb4_unicode_ci',
  multipleStatements: true
});

// Test connection
pool.getConnection()
  .then(conn => {
    console.log('Successfully connected to MySQL database');
    conn.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

// Utility functions
const execute = async (sql, params) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

const query = async (sql, params) => {
  const [rows] = await pool.query(sql, params);
  return rows;
};

module.exports = {
  pool,
  execute,
  query
};




// const mysql = require('mysql2/promise');
// const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

// const pool = mysql.createPool({
//   host: DB_HOST || 'localhost',
//   user: DB_USER || 'root',
//   password: DB_PASSWORD || '',
//   database: DB_NAME || 'transport_booking',
//   port: DB_PORT || 3306,
//   waitForConnections: true,
//   connectionLimit: 20,
//   queueLimit: 0,
//   timezone: '+00:00',
//   charset: 'utf8mb4_unicode_ci'
// });

// // Test the connection
// pool.getConnection()
//   .then(conn => {
//     console.log('Successfully connected to MySQL database');
//     conn.release();
//   })
//   .catch(err => {
//     console.error('Database connection failed:', err);
//     process.exit(1);
//   });

// module.exports = {
//   pool,
//   execute: async (sql, params) => {
//     const [rows] = await pool.execute(sql, params);
//     return rows;
//   },
//   query: async (sql, params) => {
//     const [rows] = await pool.query(sql, params);
//     return rows;
//   }
// };