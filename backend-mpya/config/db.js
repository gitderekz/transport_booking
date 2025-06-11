require('dotenv').config();
const { Sequelize, Op } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
      // evict: 1000 // Add this for production
    },
    // define: {
    //   timestamps: true,
    //   underscored: true,
    //   createdAt: 'created_at',
    //   updatedAt: 'updated_at',
    //   freezeTableName: true
    // },
    // dialectOptions: {
    //   charset: 'utf8mb4',
    //   collate: 'utf8mb4_unicode_ci'
    // }
  }
);

module.exports = {
  sequelize,
  Op  // Export Op for use in queries
};
// ****************************



// require('dotenv').config();
// const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST,
//     dialect: 'mysql',
//     logging: process.env.NODE_ENV === 'development' ? console.log : false,
//     pool: {
//       max: 5,
//       min: 0,
//       acquire: 30000,
//       idle: 10000
//     },
//     define: {
//       timestamps: true,
//       underscored: true,
//       createdAt: 'created_at',
//       updatedAt: 'updated_at',
//       freezeTableName: true
//     },
//     dialectOptions: {
//       charset: 'utf8mb4',
//       collate: 'utf8mb4_unicode_ci'
//     }
//   }
// );

// // Test the connection
// sequelize.authenticate()
//   .then(() => console.log('Database connected successfully'))
//   .catch(err => console.error('Unable to connect to the database:', err));

// module.exports = sequelize;
// // *******************************



// const mysql = require('mysql2/promise');
// require('dotenv').config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME || 'transport_booking',
//   port: process.env.DB_PORT || 3306,
//   waitForConnections: true,
//   connectionLimit: 20,
//   queueLimit: 0,
//   timezone: '+00:00',
//   charset: 'utf8mb4_unicode_ci',
//   multipleStatements: true
// });

// // Test connection
// pool.getConnection()
//   .then(conn => {
//     console.log('Successfully connected to MySQL database');
//     conn.release();
//   })
//   .catch(err => {
//     console.error('Database connection failed:', err);
//     process.exit(1);
//   });

// // Utility functions
// const execute = async (sql, params) => {
//   const [rows] = await pool.execute(sql, params);
//   return rows;
// };

// const query = async (sql, params) => {
//   const [rows] = await pool.query(sql, params);
//   return rows;
// };

// module.exports = {
//   pool,
//   execute,
//   query
// };
// // ****************************



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