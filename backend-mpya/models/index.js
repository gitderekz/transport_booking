const path = require('path');
const fs = require('fs');
const Sequelize = require('sequelize');
const { sequelize, Op } = require('../config/db');
const basename = path.basename(__filename);

const db = {
  sequelize,
  Sequelize,
  Op  // Make Op available through models
};

// Read all model files and import them
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Setup associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

module.exports = db;



// // models/index.js
// const sequelize = require('../config/db');

// // Import all models
// const User = require('./User');
// const Transport = require('./Transport');
// const Route = require('./Route');
// const Stop = require('./Stop');
// const Booking = require('./Booking');
// const BookedSeat = require('./BookedSeat');

// // Initialize associations
// User.associate({ 
//   Booking: require('./Booking') 
// });
// Transport.associate({ 
//   Route: require('./Route'),
//   Booking: require('./Booking') 
// });
// Route.associate({ 
//   Transport: require('./Transport'),
//   Stop: require('./Stop'),
//   Booking: require('./Booking') 
// });
// Stop.associate({ 
//   Route: require('./Route'),
//   Booking: require('./Booking') 
// });
// Booking.associate({ 
//   User: require('./User'),
//   Route: require('./Route'),
//   Transport: require('./Transport'),
//   Stop: require('./Stop'),
//   BookedSeat: require('./BookedSeat') 
// });
// BookedSeat.associate({ 
//   Booking: require('./Booking') 
// });

// module.exports = {
//   sequelize,
//   User,
//   Transport,
//   Route,
//   Stop,
//   Booking,
//   BookedSeat
// };