module.exports = (sequelize, DataTypes) => {
  const Stop = sequelize.define('Stop', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    route_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'routes',
        key: 'id'
      }
    },
    station_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    station_code: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    arrival_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    departure_time: {
      type: DataTypes.TIME,
      allowNull: true,
      validate: {
        isAfterArrival(value) {
          if (this.arrival_time && value && value < this.arrival_time) {
            throw new Error('Departure time must be after arrival time');
          }
        }
      }
    },
    sequence_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    additional_fee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    }
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    tableName: 'stops',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['route_id', 'sequence_order']
      },
      {
        fields: ['station_name', 'station_code']
      }
    ]
  });

  Stop.associate = (models) => {
    Stop.belongsTo(models.Route, {
      foreignKey: 'route_id',
      as: 'route'
    });
    Stop.hasMany(models.Booking, {
      foreignKey: 'pickup_stop_id',
      as: 'pickup_bookings'
    });
    Stop.hasMany(models.Booking, {
      foreignKey: 'dropoff_stop_id',
      as: 'dropoff_bookings'
    });
  };

  return Stop;
};



// module.exports = (sequelize, DataTypes) => {
//   const Stop = sequelize.define('Stop', {
//     station_name: {
//       type: DataTypes.STRING(100),
//       allowNull: false
//     },
//     station_code: {
//       type: DataTypes.STRING(10),
//       allowNull: true
//     },
//     arrival_time: {
//       type: DataTypes.TIME,
//       allowNull: true
//     },
//     departure_time: {
//       type: DataTypes.TIME,
//       allowNull: true,
//       validate: {
//         isAfterArrival(value) {
//           if (this.arrival_time && value && value < this.arrival_time) {
//             throw new Error('Departure time must be after arrival time');
//           }
//         }
//       }
//     },
//     sequence_order: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       validate: {
//         min: 1
//       }
//     },
//     additional_fee: {
//       type: DataTypes.DECIMAL(10, 2),
//       defaultValue: 0.00,
//       validate: {
//         min: 0
//       }
//     }
//   }, {
//     timestamps: true,
//     createdAt: 'created_at',
//     updatedAt: 'updated_at',
//     tableName: 'stops',
//     indexes: [
//       {
//         unique: true,
//         fields: ['route_id', 'sequence_order']
//       }
//     ]
//   });

//   Stop.associate = (models) => {
//     Stop.belongsTo(models.Route, {
//       foreignKey: 'route_id',
//       as: 'route'
//     });
//   };

//   return Stop;
// };
// // **************************



// class Stop {
//   constructor({
//     id,
//     route_id,
//     station_name,
//     station_code,
//     arrival_time,
//     departure_time,
//     sequence_order,
//     additional_fee,
//     created_at
//   }) {
//     this.id = id;
//     this.routeId = route_id;
//     this.stationName = station_name;
//     this.stationCode = station_code;
//     this.arrivalTime = arrival_time;
//     this.departureTime = departure_time;
//     this.sequenceOrder = sequence_order;
//     this.additionalFee = additional_fee;
//     this.createdAt = created_at;
//   }

//   static fromJson(json) {
//     return new Stop(json);
//   }

//   toJson() {
//     return {
//       id: this.id,
//       route_id: this.routeId,
//       station_name: this.stationName,
//       station_code: this.stationCode,
//       arrival_time: this.arrivalTime,
//       departure_time: this.departureTime,
//       sequence_order: this.sequenceOrder,
//       additional_fee: this.additionalFee,
//       created_at: this.createdAt
//     };
//   }
// }

// module.exports = Stop;