module.exports = (sequelize, DataTypes) => {
  const Route = sequelize.define('Route', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    transport_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'transports',
        key: 'id'
      }
    },
    origin: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    destination: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEqual(value) {
          if (value === this.origin) {
            throw new Error('Origin and destination cannot be the same');
          }
        }
      }
    },
    base_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1
      }
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    tableName: 'routes',
    underscored: true
  });

  Route.associate = (models) => {
    Route.belongsTo(models.Transport, {
      foreignKey: 'transport_id',
      as: 'transport'
    });
    Route.hasMany(models.Stop, {
      foreignKey: 'route_id',
      as: 'stops'
    });
    Route.hasMany(models.Booking, {
      foreignKey: 'route_id',
      as: 'bookings'
    });
  };

  return Route;
};
// **************************



// module.exports = (sequelize, DataTypes) => {
//   const Route = sequelize.define('Route', {
//     origin: {
//       type: DataTypes.STRING(100),
//       allowNull: false
//     },
//     destination: {
//       type: DataTypes.STRING(100),
//       allowNull: false,
//       validate: {
//         notEqual(value) {
//           if (value === this.origin) {
//             throw new Error('Origin and destination cannot be the same');
//           }
//         }
//       }
//     },
//     base_price: {
//       type: DataTypes.DECIMAL(10, 2),
//       allowNull: false,
//       validate: {
//         min: 0
//       }
//     },
//     duration_minutes: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//       validate: {
//         min: 1
//       }
//     },
//     active: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: true
//     }
//   }, {
//     timestamps: true,
//     createdAt: 'created_at',
//     updatedAt: 'updated_at',
//     tableName: 'routes'
//   });

//   Route.associate = (models) => {
//     Route.belongsTo(models.Transport, {
//       foreignKey: 'transport_id',
//       as: 'transport'
//     });
//     Route.hasMany(models.Stop, {
//       foreignKey: 'route_id',
//       as: 'stops'
//     });
//     Route.hasMany(models.Booking, {
//       foreignKey: 'route_id',
//       as: 'bookings'
//     });
//   };

//   return Route;
// };
// // *****************************



// class Route {
//   constructor({
//     id,
//     transport_id,
//     origin,
//     destination,
//     base_price,
//     duration_minutes,
//     active,
//     created_at
//   }) {
//     this.id = id;
//     this.transportId = transport_id;
//     this.origin = origin;
//     this.destination = destination;
//     this.basePrice = base_price;
//     this.durationMinutes = duration_minutes;
//     this.active = active;
//     this.createdAt = created_at;
//   }

//   static fromJson(json) {
//     return new Route(json);
//   }

//   toJson() {
//     return {
//       id: this.id,
//       transport_id: this.transportId,
//       origin: this.origin,
//       destination: this.destination,
//       base_price: this.basePrice,
//       duration_minutes: this.durationMinutes,
//       active: this.active,
//       created_at: this.createdAt
//     };
//   }
// }

// module.exports = Route;