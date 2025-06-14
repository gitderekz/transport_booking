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










// -------------------------------------------------
// TABLES



// -- Start transaction for data consistency
// START TRANSACTION;

// -- Update Bus 1: InterCity Express
// UPDATE transports
// SET
//     seat_layout = JSON_OBJECT(
//         'rows', 10,
//         'columns', 5,
//         'layout', '2-2',
//         'seats', JSON_ARRAY(
//             JSON_OBJECT('number', '1A'), JSON_OBJECT('number', '1B'), JSON_OBJECT('number', '1C'), JSON_OBJECT('number', '1D'),
//             JSON_OBJECT('number', '2A'), JSON_OBJECT('number', '2B'), JSON_OBJECT('number', '2C'), JSON_OBJECT('number', '2D'),
//             JSON_OBJECT('number', '3A'), JSON_OBJECT('number', '3B'), JSON_OBJECT('number', '3C'), JSON_OBJECT('number', '3D'),
//             JSON_OBJECT('number', '4A'), JSON_OBJECT('number', '4B'), JSON_OBJECT('number', '4C'), JSON_OBJECT('number', '4D'),
//             JSON_OBJECT('number', '5A'), JSON_OBJECT('number', '5B'), JSON_OBJECT('number', '5C'), JSON_OBJECT('number', '5D'),
//             JSON_OBJECT('number', '6A'), JSON_OBJECT('number', '6B'), JSON_OBJECT('number', '6C'), JSON_OBJECT('number', '6D'),
//             JSON_OBJECT('number', '7A'), JSON_OBJECT('number', '7B'), JSON_OBJECT('number', '7C'), JSON_OBJECT('number', '7D'),
//             JSON_OBJECT('number', '8A'), JSON_OBJECT('number', '8B'), JSON_OBJECT('number', '8C'), JSON_OBJECT('number', '8D'),
//             JSON_OBJECT('number', '9A'), JSON_OBJECT('number', '9B'), JSON_OBJECT('number', '9C'), JSON_OBJECT('number', '9D'),
//             JSON_OBJECT('number', '10A'), JSON_OBJECT('number', '10B'), JSON_OBJECT('number', '10C'), JSON_OBJECT('number', '10D')
//         )
//     ),
//     amenities = JSON_OBJECT(
//         'wifi', TRUE,
//         'ac', TRUE,
//         'toilet', TRUE,
//         'charging_ports', TRUE,
//         'reclining_seats', TRUE
//     )
// WHERE id = 1;

// -- Update Plane 2: AirJet 747
// UPDATE transports
// SET
//     seat_layout = JSON_OBJECT(
//         'rows', 30,
//         'columns', 6,
//         'layout', '3-3',
//         'seats', JSON_ARRAY(
//             -- Row 1 to Row 30, Seats A to F
//             JSON_OBJECT('number', '1A'), JSON_OBJECT('number', '1B'), JSON_OBJECT('number', '1C'), JSON_OBJECT('number', '1D'), JSON_OBJECT('number', '1E'), JSON_OBJECT('number', '1F'),
//             JSON_OBJECT('number', '2A'), JSON_OBJECT('number', '2B'), JSON_OBJECT('number', '2C'), JSON_OBJECT('number', '2D'), JSON_OBJECT('number', '2E'), JSON_OBJECT('number', '2F'),
//             JSON_OBJECT('number', '3A'), JSON_OBJECT('number', '3B'), JSON_OBJECT('number', '3C'), JSON_OBJECT('number', '3D'), JSON_OBJECT('number', '3E'), JSON_OBJECT('number', '3F'),
//             JSON_OBJECT('number', '4A'), JSON_OBJECT('number', '4B'), JSON_OBJECT('number', '4C'), JSON_OBJECT('number', '4D'), JSON_OBJECT('number', '4E'), JSON_OBJECT('number', '4F'),
//             JSON_OBJECT('number', '5A'), JSON_OBJECT('number', '5B'), JSON_OBJECT('number', '5C'), JSON_OBJECT('number', '5D'), JSON_OBJECT('number', '5E'), JSON_OBJECT('number', '5F'),
//             JSON_OBJECT('number', '6A'), JSON_OBJECT('number', '6B'), JSON_OBJECT('number', '6C'), JSON_OBJECT('number', '6D'), JSON_OBJECT('number', '6E'), JSON_OBJECT('number', '6F'),
//             JSON_OBJECT('number', '7A'), JSON_OBJECT('number', '7B'), JSON_OBJECT('number', '7C'), JSON_OBJECT('number', '7D'), JSON_OBJECT('number', '7E'), JSON_OBJECT('number', '7F'),
//             JSON_OBJECT('number', '8A'), JSON_OBJECT('number', '8B'), JSON_OBJECT('number', '8C'), JSON_OBJECT('number', '8D'), JSON_OBJECT('number', '8E'), JSON_OBJECT('number', '8F'),
//             JSON_OBJECT('number', '9A'), JSON_OBJECT('number', '9B'), JSON_OBJECT('number', '9C'), JSON_OBJECT('number', '9D'), JSON_OBJECT('number', '9E'), JSON_OBJECT('number', '9F'),
//             JSON_OBJECT('number', '10A'), JSON_OBJECT('number', '10B'), JSON_OBJECT('number', '10C'), JSON_OBJECT('number', '10D'), JSON_OBJECT('number', '10E'), JSON_OBJECT('number', '10F'),
//             JSON_OBJECT('number', '11A'), JSON_OBJECT('number', '11B'), JSON_OBJECT('number', '11C'), JSON_OBJECT('number', '11D'), JSON_OBJECT('number', '11E'), JSON_OBJECT('number', '11F'),
//             JSON_OBJECT('number', '12A'), JSON_OBJECT('number', '12B'), JSON_OBJECT('number', '12C'), JSON_OBJECT('number', '12D'), JSON_OBJECT('number', '12E'), JSON_OBJECT('number', '12F'),
//             JSON_OBJECT('number', '13A'), JSON_OBJECT('number', '13B'), JSON_OBJECT('number', '13C'), JSON_OBJECT('number', '13D'), JSON_OBJECT('number', '13E'), JSON_OBJECT('number', '13F'),
//             JSON_OBJECT('number', '14A'), JSON_OBJECT('number', '14B'), JSON_OBJECT('number', '14C'), JSON_OBJECT('number', '14D'), JSON_OBJECT('number', '14E'), JSON_OBJECT('number', '14F'),
//             JSON_OBJECT('number', '15A'), JSON_OBJECT('number', '15B'), JSON_OBJECT('number', '15C'), JSON_OBJECT('number', '15D'), JSON_OBJECT('number', '15E'), JSON_OBJECT('number', '15F'),
//             JSON_OBJECT('number', '16A'), JSON_OBJECT('number', '16B'), JSON_OBJECT('number', '16C'), JSON_OBJECT('number', '16D'), JSON_OBJECT('number', '16E'), JSON_OBJECT('number', '16F'),
//             JSON_OBJECT('number', '17A'), JSON_OBJECT('number', '17B'), JSON_OBJECT('number', '17C'), JSON_OBJECT('number', '17D'), JSON_OBJECT('number', '17E'), JSON_OBJECT('number', '17F'),
//             JSON_OBJECT('number', '18A'), JSON_OBJECT('number', '18B'), JSON_OBJECT('number', '18C'), JSON_OBJECT('number', '18D'), JSON_OBJECT('number', '18E'), JSON_OBJECT('number', '18F'),
//             JSON_OBJECT('number', '19A'), JSON_OBJECT('number', '19B'), JSON_OBJECT('number', '19C'), JSON_OBJECT('number', '19D'), JSON_OBJECT('number', '19E'), JSON_OBJECT('number', '19F'),
//             JSON_OBJECT('number', '20A'), JSON_OBJECT('number', '20B'), JSON_OBJECT('number', '20C'), JSON_OBJECT('number', '20D'), JSON_OBJECT('number', '20E'), JSON_OBJECT('number', '20F'),
//             JSON_OBJECT('number', '21A'), JSON_OBJECT('number', '21B'), JSON_OBJECT('number', '21C'), JSON_OBJECT('number', '21D'), JSON_OBJECT('number', '21E'), JSON_OBJECT('number', '21F'),
//             JSON_OBJECT('number', '22A'), JSON_OBJECT('number', '22B'), JSON_OBJECT('number', '22C'), JSON_OBJECT('number', '22D'), JSON_OBJECT('number', '22E'), JSON_OBJECT('number', '22F'),
//             JSON_OBJECT('number', '23A'), JSON_OBJECT('number', '23B'), JSON_OBJECT('number', '23C'), JSON_OBJECT('number', '23D'), JSON_OBJECT('number', '23E'), JSON_OBJECT('number', '23F'),
//             JSON_OBJECT('number', '24A'), JSON_OBJECT('number', '24B'), JSON_OBJECT('number', '24C'), JSON_OBJECT('number', '24D'), JSON_OBJECT('number', '24E'), JSON_OBJECT('number', '24F'),
//             JSON_OBJECT('number', '25A'), JSON_OBJECT('number', '25B'), JSON_OBJECT('number', '25C'), JSON_OBJECT('number', '25D'), JSON_OBJECT('number', '25E'), JSON_OBJECT('number', '25F'),
//             JSON_OBJECT('number', '26A'), JSON_OBJECT('number', '26B'), JSON_OBJECT('number', '26C'), JSON_OBJECT('number', '26D'), JSON_OBJECT('number', '26E'), JSON_OBJECT('number', '26F'),
//             JSON_OBJECT('number', '27A'), JSON_OBJECT('number', '27B'), JSON_OBJECT('number', '27C'), JSON_OBJECT('number', '27D'), JSON_OBJECT('number', '27E'), JSON_OBJECT('number', '27F'),
//             JSON_OBJECT('number', '28A'), JSON_OBJECT('number', '28B'), JSON_OBJECT('number', '28C'), JSON_OBJECT('number', '28D'), JSON_OBJECT('number', '28E'), JSON_OBJECT('number', '28F'),
//             JSON_OBJECT('number', '29A'), JSON_OBJECT('number', '29B'), JSON_OBJECT('number', '29C'), JSON_OBJECT('number', '29D'), JSON_OBJECT('number', '29E'), JSON_OBJECT('number', '29F'),
//             JSON_OBJECT('number', '30A'), JSON_OBJECT('number', '30B'), JSON_OBJECT('number', '30C'), JSON_OBJECT('number', '30D'), JSON_OBJECT('number', '30E'), JSON_OBJECT('number', '30F')
//         )
//     ),
//     amenities = JSON_OBJECT(
//         'meals', TRUE,
//         'entertainment', TRUE,
//         'wifi', TRUE,
//         'business_class', TRUE,
//         'priority_boarding', TRUE
//     )
// WHERE id = 2;


// -- Update Train 3: BulletRail
// UPDATE transports
// SET
//     seat_layout = JSON_OBJECT(
//         'rows', 20,
//         'columns', 6,
//         'layout', '2-2',
//         'seats', JSON_ARRAY(
//             JSON_OBJECT('number', '1A'), JSON_OBJECT('number', '1B'), JSON_OBJECT('number', '1C'), JSON_OBJECT('number', '1D'),
//             JSON_OBJECT('number', '2A'), JSON_OBJECT('number', '2B'), JSON_OBJECT('number', '2C'), JSON_OBJECT('number', '2D'),
//             JSON_OBJECT('number', '3A'), JSON_OBJECT('number', '3B'), JSON_OBJECT('number', '3C'), JSON_OBJECT('number', '3D'),
//             JSON_OBJECT('number', '4A'), JSON_OBJECT('number', '4B'), JSON_OBJECT('number', '4C'), JSON_OBJECT('number', '4D'),
//             JSON_OBJECT('number', '5A'), JSON_OBJECT('number', '5B'), JSON_OBJECT('number', '5C'), JSON_OBJECT('number', '5D'),
//             JSON_OBJECT('number', '6A'), JSON_OBJECT('number', '6B'), JSON_OBJECT('number', '6C'), JSON_OBJECT('number', '6D'),
//             JSON_OBJECT('number', '7A'), JSON_OBJECT('number', '7B'), JSON_OBJECT('number', '7C'), JSON_OBJECT('number', '7D'),
//             JSON_OBJECT('number', '8A'), JSON_OBJECT('number', '8B'), JSON_OBJECT('number', '8C'), JSON_OBJECT('number', '8D'),
//             JSON_OBJECT('number', '9A'), JSON_OBJECT('number', '9B'), JSON_OBJECT('number', '9C'), JSON_OBJECT('number', '9D'),
//             JSON_OBJECT('number', '10A'), JSON_OBJECT('number', '10B'), JSON_OBJECT('number', '10C'), JSON_OBJECT('number', '10D'),
//             JSON_OBJECT('number', '11A'), JSON_OBJECT('number', '11B'), JSON_OBJECT('number', '11C'), JSON_OBJECT('number', '11D'),
//             JSON_OBJECT('number', '12A'), JSON_OBJECT('number', '12B'), JSON_OBJECT('number', '12C'), JSON_OBJECT('number', '12D'),
//             JSON_OBJECT('number', '13A'), JSON_OBJECT('number', '13B'), JSON_OBJECT('number', '13C'), JSON_OBJECT('number', '13D'),
//             JSON_OBJECT('number', '14A'), JSON_OBJECT('number', '14B'), JSON_OBJECT('number', '14C'), JSON_OBJECT('number', '14D'),
//             JSON_OBJECT('number', '15A'), JSON_OBJECT('number', '15B'), JSON_OBJECT('number', '15C'), JSON_OBJECT('number', '15D'),
//             JSON_OBJECT('number', '16A'), JSON_OBJECT('number', '16B'), JSON_OBJECT('number', '16C'), JSON_OBJECT('number', '16D'),
//             JSON_OBJECT('number', '17A'), JSON_OBJECT('number', '17B'), JSON_OBJECT('number', '17C'), JSON_OBJECT('number', '17D'),
//             JSON_OBJECT('number', '18A'), JSON_OBJECT('number', '18B'), JSON_OBJECT('number', '18C'), JSON_OBJECT('number', '18D'),
//             JSON_OBJECT('number', '19A'), JSON_OBJECT('number', '19B'), JSON_OBJECT('number', '19C'), JSON_OBJECT('number', '19D'),
//             JSON_OBJECT('number', '20A'), JSON_OBJECT('number', '20B'), JSON_OBJECT('number', '20C'), JSON_OBJECT('number', '20D')
//         )
//     ),
//     amenities = JSON_OBJECT(
//         'wifi', TRUE,
//         'power_outlets', TRUE,
//         'food_service', TRUE,
//         'luggage_space', TRUE
//     )
// WHERE id = 3;

// -- Update Ship 4: OceanWave
// UPDATE transports
// SET
//     seat_layout = JSON_OBJECT(
//         'rows', 50,
//         'columns', 6,
//         'layout', '3-3',
//         'seats', JSON_ARRAY(
//             JSON_OBJECT('number', '1A'), JSON_OBJECT('number', '1B'), JSON_OBJECT('number', '1C'),
//             JSON_OBJECT('number', '1D'), JSON_OBJECT('number', '1E'), JSON_OBJECT('number', '1F'),
//             JSON_OBJECT('number', '2A'), JSON_OBJECT('number', '2B'), JSON_OBJECT('number', '2C'),
//             JSON_OBJECT('number', '2D'), JSON_OBJECT('number', '2E'), JSON_OBJECT('number', '2F'),
//             JSON_OBJECT('number', '3A'), JSON_OBJECT('number', '3B'), JSON_OBJECT('number', '3C'),
//             JSON_OBJECT('number', '3D'), JSON_OBJECT('number', '3E'), JSON_OBJECT('number', '3F'),
//             JSON_OBJECT('number', '4A'), JSON_OBJECT('number', '4B'), JSON_OBJECT('number', '4C'),
//             JSON_OBJECT('number', '4D'), JSON_OBJECT('number', '4E'), JSON_OBJECT('number', '4F'),
//             JSON_OBJECT('number', '5A'), JSON_OBJECT('number', '5B'), JSON_OBJECT('number', '5C'),
//             JSON_OBJECT('number', '5D'), JSON_OBJECT('number', '5E'), JSON_OBJECT('number', '5F'),
//             JSON_OBJECT('number', '6A'), JSON_OBJECT('number', '6B'), JSON_OBJECT('number', '6C'),
//             JSON_OBJECT('number', '6D'), JSON_OBJECT('number', '6E'), JSON_OBJECT('number', '6F'),
//             JSON_OBJECT('number', '7A'), JSON_OBJECT('number', '7B'), JSON_OBJECT('number', '7C'),
//             JSON_OBJECT('number', '7D'), JSON_OBJECT('number', '7E'), JSON_OBJECT('number', '7F'),
//             JSON_OBJECT('number', '8A'), JSON_OBJECT('number', '8B'), JSON_OBJECT('number', '8C'),
//             JSON_OBJECT('number', '8D'), JSON_OBJECT('number', '8E'), JSON_OBJECT('number', '8F'),
//             JSON_OBJECT('number', '9A'), JSON_OBJECT('number', '9B'), JSON_OBJECT('number', '9C'),
//             JSON_OBJECT('number', '9D'), JSON_OBJECT('number', '9E'), JSON_OBJECT('number', '9F'),
//             JSON_OBJECT('number', '10A'), JSON_OBJECT('number', '10B'), JSON_OBJECT('number', '10C'),
//             JSON_OBJECT('number', '10D'), JSON_OBJECT('number', '10E'), JSON_OBJECT('number', '10F'),
//             JSON_OBJECT('number', '11A'), JSON_OBJECT('number', '11B'), JSON_OBJECT('number', '11C'),
//             JSON_OBJECT('number', '11D'), JSON_OBJECT('number', '11E'), JSON_OBJECT('number', '11F'),
//             JSON_OBJECT('number', '12A'), JSON_OBJECT('number', '12B'), JSON_OBJECT('number', '12C'),
//             JSON_OBJECT('number', '12D'), JSON_OBJECT('number', '12E'), JSON_OBJECT('number', '12F'),
//             JSON_OBJECT('number', '13A'), JSON_OBJECT('number', '13B'), JSON_OBJECT('number', '13C'),
//             JSON_OBJECT('number', '13D'), JSON_OBJECT('number', '13E'), JSON_OBJECT('number', '13F'),
//             JSON_OBJECT('number', '14A'), JSON_OBJECT('number', '14B'), JSON_OBJECT('number', '14C'),
//             JSON_OBJECT('number', '14D'), JSON_OBJECT('number', '14E'), JSON_OBJECT('number', '14F'),
//             JSON_OBJECT('number', '15A'), JSON_OBJECT('number', '15B'), JSON_OBJECT('number', '15C'),
//             JSON_OBJECT('number', '15D'), JSON_OBJECT('number', '15E'), JSON_OBJECT('number', '15F'),
//             JSON_OBJECT('number', '16A'), JSON_OBJECT('number', '16B'), JSON_OBJECT('number', '16C'),
//             JSON_OBJECT('number', '16D'), JSON_OBJECT('number', '16E'), JSON_OBJECT('number', '16F'),
//             JSON_OBJECT('number', '17A'), JSON_OBJECT('number', '17B'), JSON_OBJECT('number', '17C'),
//             JSON_OBJECT('number', '17D'), JSON_OBJECT('number', '17E'), JSON_OBJECT('number', '17F'),
//             JSON_OBJECT('number', '18A'), JSON_OBJECT('number', '18B'), JSON_OBJECT('number', '18C'),
//             JSON_OBJECT('number', '18D'), JSON_OBJECT('number', '18E'), JSON_OBJECT('number', '18F'),
//             JSON_OBJECT('number', '19A'), JSON_OBJECT('number', '19B'), JSON_OBJECT('number', '19C'),
//             JSON_OBJECT('number', '19D'), JSON_OBJECT('number', '19E'), JSON_OBJECT('number', '19F'),
//             JSON_OBJECT('number', '20A'), JSON_OBJECT('number', '20B'), JSON_OBJECT('number', '20C'),
//             JSON_OBJECT('number', '20D'), JSON_OBJECT('number', '20E'), JSON_OBJECT('number', '20F'),
//             JSON_OBJECT('number', '21A'), JSON_OBJECT('number', '21B'), JSON_OBJECT('number', '21C'),
//             JSON_OBJECT('number', '21D'), JSON_OBJECT('number', '21E'), JSON_OBJECT('number', '21F'),
//             JSON_OBJECT('number', '22A'), JSON_OBJECT('number', '22B'), JSON_OBJECT('number', '22C'),
//             JSON_OBJECT('number', '22D'), JSON_OBJECT('number', '22E'), JSON_OBJECT('number', '22F'),
//             JSON_OBJECT('number', '23A'), JSON_OBJECT('number', '23B'), JSON_OBJECT('number', '23C'),
//             JSON_OBJECT('number', '23D'), JSON_OBJECT('number', '23E'), JSON_OBJECT('number', '23F'),
//             JSON_OBJECT('number', '24A'), JSON_OBJECT('number', '24B'), JSON_OBJECT('number', '24C'),
//             JSON_OBJECT('number', '24D'), JSON_OBJECT('number', '24E'), JSON_OBJECT('number', '24F'),
//             JSON_OBJECT('number', '25A'), JSON_OBJECT('number', '25B'), JSON_OBJECT('number', '25C'),
//             JSON_OBJECT('number', '25D'), JSON_OBJECT('number', '25E'), JSON_OBJECT('number', '25F'),
//             JSON_OBJECT('number', '26A'), JSON_OBJECT('number', '26B'), JSON_OBJECT('number', '26C'),
//             JSON_OBJECT('number', '26D'), JSON_OBJECT('number', '26E'), JSON_OBJECT('number', '26F'),
//             JSON_OBJECT('number', '27A'), JSON_OBJECT('number', '27B'), JSON_OBJECT('number', '27C'),
//             JSON_OBJECT('number', '27D'), JSON_OBJECT('number', '27E'), JSON_OBJECT('number', '27F'),
//             JSON_OBJECT('number', '28A'), JSON_OBJECT('number', '28B'), JSON_OBJECT('number', '28C'),
//             JSON_OBJECT('number', '28D'), JSON_OBJECT('number', '28E'), JSON_OBJECT('number', '28F'),
//             JSON_OBJECT('number', '29A'), JSON_OBJECT('number', '29B'), JSON_OBJECT('number', '29C'),
//             JSON_OBJECT('number', '29D'), JSON_OBJECT('number', '29E'), JSON_OBJECT('number', '29F'),
//             JSON_OBJECT('number', '30A'), JSON_OBJECT('number', '30B'), JSON_OBJECT('number', '30C'),
//             JSON_OBJECT('number', '30D'), JSON_OBJECT('number', '30E'), JSON_OBJECT('number', '30F'),
//             JSON_OBJECT('number', '31A'), JSON_OBJECT('number', '31B'), JSON_OBJECT('number', '31C'),
//             JSON_OBJECT('number', '31D'), JSON_OBJECT('number', '31E'), JSON_OBJECT('number', '31F'),
//             JSON_OBJECT('number', '32A'), JSON_OBJECT('number', '32B'), JSON_OBJECT('number', '32C'),
//             JSON_OBJECT('number', '32D'), JSON_OBJECT('number', '32E'), JSON_OBJECT('number', '32F'),
//             JSON_OBJECT('number', '33A'), JSON_OBJECT('number', '33B'), JSON_OBJECT('number', '33C'),
//             JSON_OBJECT('number', '33D'), JSON_OBJECT('number', '33E'), JSON_OBJECT('number', '33F'),
//             JSON_OBJECT('number', '34A'), JSON_OBJECT('number', '34B'), JSON_OBJECT('number', '34C'),
//             JSON_OBJECT('number', '34D'), JSON_OBJECT('number', '34E'), JSON_OBJECT('number', '34F'),
//             JSON_OBJECT('number', '35A'), JSON_OBJECT('number', '35B'), JSON_OBJECT('number', '35C'),
//             JSON_OBJECT('number', '35D'), JSON_OBJECT('number', '35E'), JSON_OBJECT('number', '35F'),
//             JSON_OBJECT('number', '36A'), JSON_OBJECT('number', '36B'), JSON_OBJECT('number', '36C'),
//             JSON_OBJECT('number', '36D'), JSON_OBJECT('number', '36E'), JSON_OBJECT('number', '36F'),
//             JSON_OBJECT('number', '37A'), JSON_OBJECT('number', '37B'), JSON_OBJECT('number', '37C'),
//             JSON_OBJECT('number', '37D'), JSON_OBJECT('number', '37E'), JSON_OBJECT('number', '37F'),
//             JSON_OBJECT('number', '38A'), JSON_OBJECT('number', '38B'), JSON_OBJECT('number', '38C'),
//             JSON_OBJECT('number', '38D'), JSON_OBJECT('number', '38E'), JSON_OBJECT('number', '38F'),
//             JSON_OBJECT('number', '39A'), JSON_OBJECT('number', '39B'), JSON_OBJECT('number', '39C'),
//             JSON_OBJECT('number', '39D'), JSON_OBJECT('number', '39E'), JSON_OBJECT('number', '39F'),
//             JSON_OBJECT('number', '40A'), JSON_OBJECT('number', '40B'), JSON_OBJECT('number', '40C'),
//             JSON_OBJECT('number', '40D'), JSON_OBJECT('number', '40E'), JSON_OBJECT('number', '40F'),
//             JSON_OBJECT('number', '41A'), JSON_OBJECT('number', '41B'), JSON_OBJECT('number', '41C'),
//             JSON_OBJECT('number', '41D'), JSON_OBJECT('number', '41E'), JSON_OBJECT('number', '41F'),
//             JSON_OBJECT('number', '42A'), JSON_OBJECT('number', '42B'), JSON_OBJECT('number', '42C'),
//             JSON_OBJECT('number', '42D'), JSON_OBJECT('number', '42E'), JSON_OBJECT('number', '42F'),
//             JSON_OBJECT('number', '43A'), JSON_OBJECT('number', '43B'), JSON_OBJECT('number', '43C'),
//             JSON_OBJECT('number', '43D'), JSON_OBJECT('number', '43E'), JSON_OBJECT('number', '43F'),
//             JSON_OBJECT('number', '44A'), JSON_OBJECT('number', '44B'), JSON_OBJECT('number', '44C'),
//             JSON_OBJECT('number', '44D'), JSON_OBJECT('number', '44E'), JSON_OBJECT('number', '44F'),
//             JSON_OBJECT('number', '45A'), JSON_OBJECT('number', '45B'), JSON_OBJECT('number', '45C'),
//             JSON_OBJECT('number', '45D'), JSON_OBJECT('number', '45E'), JSON_OBJECT('number', '45F'),
//             JSON_OBJECT('number', '46A'), JSON_OBJECT('number', '46B'), JSON_OBJECT('number', '46C'),
//             JSON_OBJECT('number', '46D'), JSON_OBJECT('number', '46E'), JSON_OBJECT('number', '46F'),
//             JSON_OBJECT('number', '47A'), JSON_OBJECT('number', '47B'), JSON_OBJECT('number', '47C'),
//             JSON_OBJECT('number', '47D'), JSON_OBJECT('number', '47E'), JSON_OBJECT('number', '47F'),
//             JSON_OBJECT('number', '48A'), JSON_OBJECT('number', '48B'), JSON_OBJECT('number', '48C'),
//             JSON_OBJECT('number', '48D'), JSON_OBJECT('number', '48E'), JSON_OBJECT('number', '48F'),
//             JSON_OBJECT('number', '49A'), JSON_OBJECT('number', '49B'), JSON_OBJECT('number', '49C'),
//             JSON_OBJECT('number', '49D'), JSON_OBJECT('number', '49E'), JSON_OBJECT('number', '49F'),
//             JSON_OBJECT('number', '50A'), JSON_OBJECT('number', '50B'), JSON_OBJECT('number', '50C'),
//             JSON_OBJECT('number', '50D'), JSON_OBJECT('number', '50E'), JSON_OBJECT('number', '50F')
//         )
//     ),
//     amenities = JSON_OBJECT(
//         'bar', TRUE,
//         'restaurant', TRUE,
//         'pool', TRUE,
//         'cabins', TRUE,
//         'entertainment', TRUE
//     )
// WHERE id = 4;

// -- Update Boat 5: LakeCruiser
// UPDATE transports
// SET
//     seat_layout = JSON_OBJECT(
//         'rows', 6,
//         'columns', 5,
//         'layout', '2-2',
//         'seats', JSON_ARRAY(
//             JSON_OBJECT('number', '1A'), JSON_OBJECT('number', '1B'), JSON_OBJECT('number', '1C'), JSON_OBJECT('number', '1D'),
//             JSON_OBJECT('number', '2A'), JSON_OBJECT('number', '2B'), JSON_OBJECT('number', '2C'), JSON_OBJECT('number', '2D'),
//             JSON_OBJECT('number', '3A'), JSON_OBJECT('number', '3B'), JSON_OBJECT('number', '3C'), JSON_OBJECT('number', '3D'),
//             JSON_OBJECT('number', '4A'), JSON_OBJECT('number', '4B'), JSON_OBJECT('number', '4C'), JSON_OBJECT('number', '4D'),
//             JSON_OBJECT('number', '5A'), JSON_OBJECT('number', '5B'), JSON_OBJECT('number', '5C'), JSON_OBJECT('number', '5D'),
//             JSON_OBJECT('number', '6A'), JSON_OBJECT('number', '6B'), JSON_OBJECT('number', '6C'), JSON_OBJECT('number', '6D')
//         )
//     ),
//     amenities = JSON_OBJECT(
//         'life_jackets', TRUE,
//         'covered_seating', TRUE,
//         'refreshments', TRUE
//     )
// WHERE id = 5;

// -- Update Bus 6: MetroRunner
// UPDATE transports
// SET
//     seat_layout = JSON_OBJECT(
//         'rows', 9,
//         'columns', 5,
//         'layout', '2-2',
//         'seats', JSON_ARRAY(
//             JSON_OBJECT('number', '1A'), JSON_OBJECT('number', '1B'), JSON_OBJECT('number', '1C'), JSON_OBJECT('number', '1D'),
//             JSON_OBJECT('number', '2A'), JSON_OBJECT('number', '2B'), JSON_OBJECT('number', '2C'), JSON_OBJECT('number', '2D'),
//             JSON_OBJECT('number', '3A'), JSON_OBJECT('number', '3B'), JSON_OBJECT('number', '3C'), JSON_OBJECT('number', '3D'),
//             JSON_OBJECT('number', '4A'), JSON_OBJECT('number', '4B'), JSON_OBJECT('number', '4C'), JSON_OBJECT('number', '4D'),
//             JSON_OBJECT('number', '5A'), JSON_OBJECT('number', '5B'), JSON_OBJECT('number', '5C'), JSON_OBJECT('number', '5D'),
//             JSON_OBJECT('number', '6A'), JSON_OBJECT('number', '6B'), JSON_OBJECT('number', '6C'), JSON_OBJECT('number', '6D'),
//             JSON_OBJECT('number', '7A'), JSON_OBJECT('number', '7B'), JSON_OBJECT('number', '7C'), JSON_OBJECT('number', '7D'),
//             JSON_OBJECT('number', '8A'), JSON_OBJECT('number', '8B'), JSON_OBJECT('number', '8C'), JSON_OBJECT('number', '8D'),
//             JSON_OBJECT('number', '9A'), JSON_OBJECT('number', '9B'), JSON_OBJECT('number', '9C'), JSON_OBJECT('number', '9D')
//         )
//     ),
//     amenities = JSON_OBJECT(
//         'ac', TRUE,
//         'wheelchair_access', TRUE,
//         'storage_space', TRUE
//     )
// WHERE id = 6;

// -- Update Plane 7: FlyMax
// UPDATE transports
// SET
//     seat_layout = JSON_OBJECT(
//         'rows', 44,
//         'columns', 5,
//         'layout', '3-2',
//         'seats', JSON_ARRAY(
//             JSON_OBJECT('number', '1A'), JSON_OBJECT('number', '1B'), JSON_OBJECT('number', '1C'), JSON_OBJECT('number', '1D'), JSON_OBJECT('number', '1E'),
//             JSON_OBJECT('number', '2A'), JSON_OBJECT('number', '2B'), JSON_OBJECT('number', '2C'), JSON_OBJECT('number', '2D'), JSON_OBJECT('number', '2E'),
//             JSON_OBJECT('number', '3A'), JSON_OBJECT('number', '3B'), JSON_OBJECT('number', '3C'), JSON_OBJECT('number', '3D'), JSON_OBJECT('number', '3E'),
//             JSON_OBJECT('number', '4A'), JSON_OBJECT('number', '4B'), JSON_OBJECT('number', '4C'), JSON_OBJECT('number', '4D'), JSON_OBJECT('number', '4E'),
//             JSON_OBJECT('number', '5A'), JSON_OBJECT('number', '5B'), JSON_OBJECT('number', '5C'), JSON_OBJECT('number', '5D'), JSON_OBJECT('number', '5E'),
//             JSON_OBJECT('number', '6A'), JSON_OBJECT('number', '6B'), JSON_OBJECT('number', '6C'), JSON_OBJECT('number', '6D'), JSON_OBJECT('number', '6E'),
//             JSON_OBJECT('number', '7A'), JSON_OBJECT('number', '7B'), JSON_OBJECT('number', '7C'), JSON_OBJECT('number', '7D'), JSON_OBJECT('number', '7E'),
//             JSON_OBJECT('number', '8A'), JSON_OBJECT('number', '8B'), JSON_OBJECT('number', '8C'), JSON_OBJECT('number', '8D'), JSON_OBJECT('number', '8E'),
//             JSON_OBJECT('number', '9A'), JSON_OBJECT('number', '9B'), JSON_OBJECT('number', '9C'), JSON_OBJECT('number', '9D'), JSON_OBJECT('number', '9E'),
//             JSON_OBJECT('number', '10A'), JSON_OBJECT('number', '10B'), JSON_OBJECT('number', '10C'), JSON_OBJECT('number', '10D'), JSON_OBJECT('number', '10E'),
//             JSON_OBJECT('number', '11A'), JSON_OBJECT('number', '11B'), JSON_OBJECT('number', '11C'), JSON_OBJECT('number', '11D'), JSON_OBJECT('number', '11E'),
//             JSON_OBJECT('number', '12A'), JSON_OBJECT('number', '12B'), JSON_OBJECT('number', '12C'), JSON_OBJECT('number', '12D'), JSON_OBJECT('number', '12E'),
//             JSON_OBJECT('number', '13A'), JSON_OBJECT('number', '13B'), JSON_OBJECT('number', '13C'), JSON_OBJECT('number', '13D'), JSON_OBJECT('number', '13E'),
//             JSON_OBJECT('number', '14A'), JSON_OBJECT('number', '14B'), JSON_OBJECT('number', '14C'), JSON_OBJECT('number', '14D'), JSON_OBJECT('number', '14E'),
//             JSON_OBJECT('number', '15A'), JSON_OBJECT('number', '15B'), JSON_OBJECT('number', '15C'), JSON_OBJECT('number', '15D'), JSON_OBJECT('number', '15E'),
//             JSON_OBJECT('number', '16A'), JSON_OBJECT('number', '16B'), JSON_OBJECT('number', '16C'), JSON_OBJECT('number', '16D'), JSON_OBJECT('number', '16E'),
//             JSON_OBJECT('number', '17A'), JSON_OBJECT('number', '17B'), JSON_OBJECT('number', '17C'), JSON_OBJECT('number', '17D'), JSON_OBJECT('number', '17E'),
//             JSON_OBJECT('number', '18A'), JSON_OBJECT('number', '18B'), JSON_OBJECT('number', '18C'), JSON_OBJECT('number', '18D'), JSON_OBJECT('number', '18E'),
//             JSON_OBJECT('number', '19A'), JSON_OBJECT('number', '19B'), JSON_OBJECT('number', '19C'), JSON_OBJECT('number', '19D'), JSON_OBJECT('number', '19E'),
//             JSON_OBJECT('number', '20A'), JSON_OBJECT('number', '20B'), JSON_OBJECT('number', '20C'), JSON_OBJECT('number', '20D'), JSON_OBJECT('number', '20E'),
//             JSON_OBJECT('number', '21A'), JSON_OBJECT('number', '21B'), JSON_OBJECT('number', '21C'), JSON_OBJECT('number', '21D'), JSON_OBJECT('number', '21E'),
//             JSON_OBJECT('number', '22A'), JSON_OBJECT('number', '22B'), JSON_OBJECT('number', '22C'), JSON_OBJECT('number', '22D'), JSON_OBJECT('number', '22E'),
//             JSON_OBJECT('number', '23A'), JSON_OBJECT('number', '23B'), JSON_OBJECT('number', '23C'), JSON_OBJECT('number', '23D'), JSON_OBJECT('number', '23E'),
//             JSON_OBJECT('number', '24A'), JSON_OBJECT('number', '24B'), JSON_OBJECT('number', '24C'), JSON_OBJECT('number', '24D'), JSON_OBJECT('number', '24E'),
//             JSON_OBJECT('number', '25A'), JSON_OBJECT('number', '25B'), JSON_OBJECT('number', '25C'), JSON_OBJECT('number', '25D'), JSON_OBJECT('number', '25E'),
//             JSON_OBJECT('number', '26A'), JSON_OBJECT('number', '26B'), JSON_OBJECT('number', '26C'), JSON_OBJECT('number', '26D'), JSON_OBJECT('number', '26E'),
//             JSON_OBJECT('number', '27A'), JSON_OBJECT('number', '27B'), JSON_OBJECT('number', '27C'), JSON_OBJECT('number', '27D'), JSON_OBJECT('number', '27E'),
//             JSON_OBJECT('number', '28A'), JSON_OBJECT('number', '28B'), JSON_OBJECT('number', '28C'), JSON_OBJECT('number', '28D'), JSON_OBJECT('number', '28E'),
//             JSON_OBJECT('number', '29A'), JSON_OBJECT('number', '29B'), JSON_OBJECT('number', '29C'), JSON_OBJECT('number', '29D'), JSON_OBJECT('number', '29E'),
//             JSON_OBJECT('number', '30A'), JSON_OBJECT('number', '30B'), JSON_OBJECT('number', '30C'), JSON_OBJECT('number', '30D'), JSON_OBJECT('number', '30E'),
//             JSON_OBJECT('number', '31A'), JSON_OBJECT('number', '31B'), JSON_OBJECT('number', '31C'), JSON_OBJECT('number', '31D'), JSON_OBJECT('number', '31E'),
//             JSON_OBJECT('number', '32A'), JSON_OBJECT('number', '32B'), JSON_OBJECT('number', '32C'), JSON_OBJECT('number', '32D'), JSON_OBJECT('number', '32E'),
//             JSON_OBJECT('number', '33A'), JSON_OBJECT('number', '33B'), JSON_OBJECT('number', '33C'), JSON_OBJECT('number', '33D'), JSON_OBJECT('number', '33E'),
//             JSON_OBJECT('number', '34A'), JSON_OBJECT('number', '34B'), JSON_OBJECT('number', '34C'), JSON_OBJECT('number', '34D'), JSON_OBJECT('number', '34E'),
//             JSON_OBJECT('number', '35A'), JSON_OBJECT('number', '35B'), JSON_OBJECT('number', '35C'), JSON_OBJECT('number', '35D'), JSON_OBJECT('number', '35E'),
//             JSON_OBJECT('number', '36A'), JSON_OBJECT('number', '36B'), JSON_OBJECT('number', '36C'), JSON_OBJECT('number', '36D'), JSON_OBJECT('number', '36E'),
//             JSON_OBJECT('number', '37A'), JSON_OBJECT('number', '37B'), JSON_OBJECT('number', '37C'), JSON_OBJECT('number', '37D'), JSON_OBJECT('number', '37E'),
//             JSON_OBJECT('number', '38A'), JSON_OBJECT('number', '38B'), JSON_OBJECT('number', '38C'), JSON_OBJECT('number', '38D'), JSON_OBJECT('number', '38E'),
//             JSON_OBJECT('number', '39A'), JSON_OBJECT('number', '39B'), JSON_OBJECT('number', '39C'), JSON_OBJECT('number', '39D'), JSON_OBJECT('number', '39E'),
//             JSON_OBJECT('number', '40A'), JSON_OBJECT('number', '40B'), JSON_OBJECT('number', '40C'), JSON_OBJECT('number', '40D'), JSON_OBJECT('number', '40E'),
//             JSON_OBJECT('number', '41A'), JSON_OBJECT('number', '41B'), JSON_OBJECT('number', '41C'), JSON_OBJECT('number', '41D'), JSON_OBJECT('number', '41E'),
//             JSON_OBJECT('number', '42A'), JSON_OBJECT('number', '42B'), JSON_OBJECT('number', '42C'), JSON_OBJECT('number', '42D'), JSON_OBJECT('number', '42E'),
//             JSON_OBJECT('number', '43A'), JSON_OBJECT('number', '43B'), JSON_OBJECT('number', '43C'), JSON_OBJECT('number', '43D'), JSON_OBJECT('number', '43E'),
//             JSON_OBJECT('number', '44A'), JSON_OBJECT('number', '44B'), JSON_OBJECT('number', '44C'), JSON_OBJECT('number', '44D'), JSON_OBJECT('number', '44E')
//         )
//     ),
//     amenities = JSON_OBJECT(
//         'entertainment', TRUE,
//         'meals', TRUE,
//         'priority_boarding', TRUE,
//         'extra_legroom', TRUE
//     )
// WHERE id = 7;

// -- Update Train 8: NightRail
// UPDATE transports
// SET
//     seat_layout = JSON_OBJECT(
//         'rows', 10,
//         'columns', 10,
//         'layout', 'sleeper',
//         'seats', JSON_ARRAY(
//             JSON_OBJECT('number', '1A', 'type', 'sleeper'),
//             JSON_OBJECT('number', '1B', 'type', 'sleeper'),
//             JSON_OBJECT('number', '1C', 'type', 'sleeper'),
//             JSON_OBJECT('number', '1D', 'type', 'sleeper'),
//             JSON_OBJECT('number', '1E', 'type', 'sleeper'),
//             JSON_OBJECT('number', '1F', 'type', 'sleeper'),
//             JSON_OBJECT('number', '1G', 'type', 'sleeper'),
//             JSON_OBJECT('number', '1H', 'type', 'sleeper'),
//             JSON_OBJECT('number', '1I', 'type', 'sleeper'),
//             JSON_OBJECT('number', '1J', 'type', 'sleeper'),

//             JSON_OBJECT('number', '2A', 'type', 'sleeper'),
//             JSON_OBJECT('number', '2B', 'type', 'sleeper'),
//             JSON_OBJECT('number', '2C', 'type', 'sleeper'),
//             JSON_OBJECT('number', '2D', 'type', 'sleeper'),
//             JSON_OBJECT('number', '2E', 'type', 'sleeper'),
//             JSON_OBJECT('number', '2F', 'type', 'sleeper'),
//             JSON_OBJECT('number', '2G', 'type', 'sleeper'),
//             JSON_OBJECT('number', '2H', 'type', 'sleeper'),
//             JSON_OBJECT('number', '2I', 'type', 'sleeper'),
//             JSON_OBJECT('number', '2J', 'type', 'sleeper'),

//             JSON_OBJECT('number', '3A', 'type', 'sleeper'),
//             JSON_OBJECT('number', '3B', 'type', 'sleeper'),
//             JSON_OBJECT('number', '3C', 'type', 'sleeper'),
//             JSON_OBJECT('number', '3D', 'type', 'sleeper'),
//             JSON_OBJECT('number', '3E', 'type', 'sleeper'),
//             JSON_OBJECT('number', '3F', 'type', 'sleeper'),
//             JSON_OBJECT('number', '3G', 'type', 'sleeper'),
//             JSON_OBJECT('number', '3H', 'type', 'sleeper'),
//             JSON_OBJECT('number', '3I', 'type', 'sleeper'),
//             JSON_OBJECT('number', '3J', 'type', 'sleeper'),

//             JSON_OBJECT('number', '4A', 'type', 'sleeper'),
//             JSON_OBJECT('number', '4B', 'type', 'sleeper'),
//             JSON_OBJECT('number', '4C', 'type', 'sleeper'),
//             JSON_OBJECT('number', '4D', 'type', 'sleeper'),
//             JSON_OBJECT('number', '4E', 'type', 'sleeper'),
//             JSON_OBJECT('number', '4F', 'type', 'sleeper'),
//             JSON_OBJECT('number', '4G', 'type', 'sleeper'),
//             JSON_OBJECT('number', '4H', 'type', 'sleeper'),
//             JSON_OBJECT('number', '4I', 'type', 'sleeper'),
//             JSON_OBJECT('number', '4J', 'type', 'sleeper'),

//             JSON_OBJECT('number', '5A', 'type', 'sleeper'),
//             JSON_OBJECT('number', '5B', 'type', 'sleeper'),
//             JSON_OBJECT('number', '5C', 'type', 'sleeper'),
//             JSON_OBJECT('number', '5D', 'type', 'sleeper'),
//             JSON_OBJECT('number', '5E', 'type', 'sleeper'),
//             JSON_OBJECT('number', '5F', 'type', 'sleeper'),
//             JSON_OBJECT('number', '5G', 'type', 'sleeper'),
//             JSON_OBJECT('number', '5H', 'type', 'sleeper'),
//             JSON_OBJECT('number', '5I', 'type', 'sleeper'),
//             JSON_OBJECT('number', '5J', 'type', 'sleeper'),

//             JSON_OBJECT('number', '6A', 'type', 'sleeper'),
//             JSON_OBJECT('number', '6B', 'type', 'sleeper'),
//             JSON_OBJECT('number', '6C', 'type', 'sleeper'),
//             JSON_OBJECT('number', '6D', 'type', 'sleeper'),
//             JSON_OBJECT('number', '6E', 'type', 'sleeper'),
//             JSON_OBJECT('number', '6F', 'type', 'sleeper'),
//             JSON_OBJECT('number', '6G', 'type', 'sleeper'),
//             JSON_OBJECT('number', '6H', 'type', 'sleeper'),
//             JSON_OBJECT('number', '6I', 'type', 'sleeper'),
//             JSON_OBJECT('number', '6J', 'type', 'sleeper'),

//             JSON_OBJECT('number', '7A', 'type', 'sleeper'),
//             JSON_OBJECT('number', '7B', 'type', 'sleeper'),
//             JSON_OBJECT('number', '7C', 'type', 'sleeper'),
//             JSON_OBJECT('number', '7D', 'type', 'sleeper'),
//             JSON_OBJECT('number', '7E', 'type', 'sleeper'),
//             JSON_OBJECT('number', '7F', 'type', 'sleeper'),
//             JSON_OBJECT('number', '7G', 'type', 'sleeper'),
//             JSON_OBJECT('number', '7H', 'type', 'sleeper'),
//             JSON_OBJECT('number', '7I', 'type', 'sleeper'),
//             JSON_OBJECT('number', '7J', 'type', 'sleeper'),

//             JSON_OBJECT('number', '8A', 'type', 'sleeper'),
//             JSON_OBJECT('number', '8B', 'type', 'sleeper'),
//             JSON_OBJECT('number', '8C', 'type', 'sleeper'),
//             JSON_OBJECT('number', '8D', 'type', 'sleeper'),
//             JSON_OBJECT('number', '8E', 'type', 'sleeper'),
//             JSON_OBJECT('number', '8F', 'type', 'sleeper'),
//             JSON_OBJECT('number', '8G', 'type', 'sleeper'),
//             JSON_OBJECT('number', '8H', 'type', 'sleeper'),
//             JSON_OBJECT('number', '8I', 'type', 'sleeper'),
//             JSON_OBJECT('number', '8J', 'type', 'sleeper'),

//             JSON_OBJECT('number', '9A', 'type', 'sleeper'),
//             JSON_OBJECT('number', '9B', 'type', 'sleeper'),
//             JSON_OBJECT('number', '9C', 'type', 'sleeper'),
//             JSON_OBJECT('number', '9D', 'type', 'sleeper'),
//             JSON_OBJECT('number', '9E', 'type', 'sleeper'),
//             JSON_OBJECT('number', '9F', 'type', 'sleeper'),
//             JSON_OBJECT('number', '9G', 'type', 'sleeper'),
//             JSON_OBJECT('number', '9H', 'type', 'sleeper'),
//             JSON_OBJECT('number', '9I', 'type', 'sleeper'),
//             JSON_OBJECT('number', '9J', 'type', 'sleeper'),

//             JSON_OBJECT('number', '10A', 'type', 'sleeper'),
//             JSON_OBJECT('number', '10B', 'type', 'sleeper'),
//             JSON_OBJECT('number', '10C', 'type', 'sleeper'),
//             JSON_OBJECT('number', '10D', 'type', 'sleeper'),
//             JSON_OBJECT('number', '10E', 'type', 'sleeper'),
//             JSON_OBJECT('number', '10F', 'type', 'sleeper'),
//             JSON_OBJECT('number', '10G', 'type', 'sleeper'),
//             JSON_OBJECT('number', '10H', 'type', 'sleeper'),
//             JSON_OBJECT('number', '10I', 'type', 'sleeper'),
//             JSON_OBJECT('number', '10J', 'type', 'sleeper')
//         )
//     ),
//     amenities = JSON_OBJECT(
//         'sleeping_berths', TRUE,
//         'bedding', TRUE,
//         'privacy_curtains', TRUE,
//         'luggage_storage', TRUE
//     )
// WHERE id = 8;

// -- Update Ship 9: CruiseStar
// UPDATE transports
// SET
//     seat_layout = JSON_OBJECT(
//         'rows', 40,
//         'columns', 10,
//         'layout', 'varied',
//         'seats', JSON_ARRAY(
//             -- Rows 1-10: Deck seats (100 seats)
//             JSON_OBJECT('number', '1A', 'type', 'deck'),
//             JSON_OBJECT('number', '1B', 'type', 'deck'),
//             JSON_OBJECT('number', '1C', 'type', 'deck'),
//             JSON_OBJECT('number', '1D', 'type', 'deck'),
//             JSON_OBJECT('number', '1E', 'type', 'deck'),
//             JSON_OBJECT('number', '1F', 'type', 'deck'),
//             JSON_OBJECT('number', '1G', 'type', 'deck'),
//             JSON_OBJECT('number', '1H', 'type', 'deck'),
//             JSON_OBJECT('number', '1I', 'type', 'deck'),
//             JSON_OBJECT('number', '1J', 'type', 'deck'),

//             -- Repeat pattern for rows 2-10 (90 more deck seats)
//             JSON_OBJECT('number', '2A', 'type', 'deck'),
//             JSON_OBJECT('number', '2B', 'type', 'deck'),
//             JSON_OBJECT('number', '2C', 'type', 'deck'),
//             JSON_OBJECT('number', '2D', 'type', 'deck'),
//             JSON_OBJECT('number', '2E', 'type', 'deck'),
//             JSON_OBJECT('number', '2F', 'type', 'deck'),
//             JSON_OBJECT('number', '2G', 'type', 'deck'),
//             JSON_OBJECT('number', '2H', 'type', 'deck'),
//             JSON_OBJECT('number', '2I', 'type', 'deck'),
//             JSON_OBJECT('number', '2J', 'type', 'deck'),

//             JSON_OBJECT('number', '3A', 'type', 'deck'),
//             JSON_OBJECT('number', '3B', 'type', 'deck'),
//             JSON_OBJECT('number', '3C', 'type', 'deck'),
//             JSON_OBJECT('number', '3D', 'type', 'deck'),
//             JSON_OBJECT('number', '3E', 'type', 'deck'),
//             JSON_OBJECT('number', '3F', 'type', 'deck'),
//             JSON_OBJECT('number', '3G', 'type', 'deck'),
//             JSON_OBJECT('number', '3H', 'type', 'deck'),
//             JSON_OBJECT('number', '3I', 'type', 'deck'),
//             JSON_OBJECT('number', '3J', 'type', 'deck'),

//             -- Rows 4-10 (70 more deck seats)...
//             -- [Additional rows 4-10 deck seats would go here]

//             -- Rows 11-30: Standard seats (200 seats)
//             JSON_OBJECT('number', '11A', 'type', 'standard'),
//             JSON_OBJECT('number', '11B', 'type', 'standard'),
//             JSON_OBJECT('number', '11C', 'type', 'standard'),
//             JSON_OBJECT('number', '11D', 'type', 'standard'),
//             JSON_OBJECT('number', '11E', 'type', 'standard'),
//             JSON_OBJECT('number', '11F', 'type', 'standard'),
//             JSON_OBJECT('number', '11G', 'type', 'standard'),
//             JSON_OBJECT('number', '11H', 'type', 'standard'),
//             JSON_OBJECT('number', '11I', 'type', 'standard'),
//             JSON_OBJECT('number', '11J', 'type', 'standard'),

//             -- Repeat pattern for rows 12-30 (190 more standard seats)
//             JSON_OBJECT('number', '12A', 'type', 'standard'),
//             JSON_OBJECT('number', '12B', 'type', 'standard'),
//             JSON_OBJECT('number', '12C', 'type', 'standard'),
//             JSON_OBJECT('number', '12D', 'type', 'standard'),
//             JSON_OBJECT('number', '12E', 'type', 'standard'),
//             JSON_OBJECT('number', '12F', 'type', 'standard'),
//             JSON_OBJECT('number', '12G', 'type', 'standard'),
//             JSON_OBJECT('number', '12H', 'type', 'standard'),
//             JSON_OBJECT('number', '12I', 'type', 'standard'),
//             JSON_OBJECT('number', '12J', 'type', 'standard'),

//             -- [Additional rows 13-30 standard seats would go here]

//             -- Rows 31-40: Cabin seats (100 seats)
//             JSON_OBJECT('number', '31A', 'type', 'cabin'),
//             JSON_OBJECT('number', '31B', 'type', 'cabin'),
//             JSON_OBJECT('number', '31C', 'type', 'cabin'),
//             JSON_OBJECT('number', '31D', 'type', 'cabin'),
//             JSON_OBJECT('number', '31E', 'type', 'cabin'),
//             JSON_OBJECT('number', '31F', 'type', 'cabin'),
//             JSON_OBJECT('number', '31G', 'type', 'cabin'),
//             JSON_OBJECT('number', '31H', 'type', 'cabin'),
//             JSON_OBJECT('number', '31I', 'type', 'cabin'),
//             JSON_OBJECT('number', '31J', 'type', 'cabin'),

//             -- Repeat pattern for rows 32-40 (90 more cabin seats)
//             JSON_OBJECT('number', '32A', 'type', 'cabin'),
//             JSON_OBJECT('number', '32B', 'type', 'cabin'),
//             JSON_OBJECT('number', '32C', 'type', 'cabin'),
//             JSON_OBJECT('number', '32D', 'type', 'cabin'),
//             JSON_OBJECT('number', '32E', 'type', 'cabin'),
//             JSON_OBJECT('number', '32F', 'type', 'cabin'),
//             JSON_OBJECT('number', '32G', 'type', 'cabin'),
//             JSON_OBJECT('number', '32H', 'type', 'cabin'),
//             JSON_OBJECT('number', '32I', 'type', 'cabin'),
//             JSON_OBJECT('number', '32J', 'type', 'cabin'),

//             -- [Additional rows 33-40 cabin seats would go here]

//             -- Final row
//             JSON_OBJECT('number', '40A', 'type', 'cabin'),
//             JSON_OBJECT('number', '40B', 'type', 'cabin'),
//             JSON_OBJECT('number', '40C', 'type', 'cabin'),
//             JSON_OBJECT('number', '40D', 'type', 'cabin'),
//             JSON_OBJECT('number', '40E', 'type', 'cabin'),
//             JSON_OBJECT('number', '40F', 'type', 'cabin'),
//             JSON_OBJECT('number', '40G', 'type', 'cabin'),
//             JSON_OBJECT('number', '40H', 'type', 'cabin'),
//             JSON_OBJECT('number', '40I', 'type', 'cabin'),
//             JSON_OBJECT('number', '40J', 'type', 'cabin')
//         )
//     ),
//     amenities = JSON_OBJECT(
//         'pool', TRUE,
//         'multiple_restaurants', TRUE,
//         'bars', TRUE,
//         'entertainment_shows', TRUE,
//         'spa', TRUE
//     )
// WHERE id = 9;

// -- Update Boat 10: RiverBreeze
// UPDATE transports
// SET
//     seat_layout = JSON_OBJECT(
//         'rows', 5,
//         'columns', 5,
//         'layout', 'open',
//         'seats', JSON_ARRAY(
//             JSON_OBJECT('number', '1A'), JSON_OBJECT('number', '1B'), JSON_OBJECT('number', '1C'), JSON_OBJECT('number', '1D'),
//             JSON_OBJECT('number', '2A'), JSON_OBJECT('number', '2B'), JSON_OBJECT('number', '2C'), JSON_OBJECT('number', '2D'),
//             JSON_OBJECT('number', '3A'), JSON_OBJECT('number', '3B'), JSON_OBJECT('number', '3C'), JSON_OBJECT('number', '3D'),
//             JSON_OBJECT('number', '4A'), JSON_OBJECT('number', '4B'), JSON_OBJECT('number', '4C'), JSON_OBJECT('number', '4D'),
//             JSON_OBJECT('number', '5A'), JSON_OBJECT('number', '5B'), JSON_OBJECT('number', '5C'), JSON_OBJECT('number', '5D')
//         )
//     ),
//     amenities = JSON_OBJECT(
//         'sun_protection', TRUE,
//         'life_vests', TRUE,
//         'refreshments', TRUE
//     )
// WHERE id = 10;

// COMMIT;




