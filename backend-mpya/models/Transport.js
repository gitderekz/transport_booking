module.exports = (sequelize, DataTypes) => {
  const Transport = sequelize.define('Transport', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: DataTypes.ENUM('bus', 'plane', 'train', 'ship', 'boat'),
      allowNull: false
    },
    identifier: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    operator: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    total_seats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    seat_layout: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidJson(value) {
          try {
            JSON.parse(JSON.stringify(value));
          } catch (e) {
            throw new Error('Invalid JSON format for seat_layout');
          }
        }
      }
    },
    amenities: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isValidJson(value) {
          if (value) {
            try {
              JSON.parse(JSON.stringify(value));
            } catch (e) {
              throw new Error('Invalid JSON format for amenities');
            }
          }
        }
      }
    }
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    tableName: 'transports',
    underscored: true,
    indexes: [
      {
        fields: ['type', 'identifier']
      },
      {
        fields: ['operator']
      }
    ]
  });

  Transport.associate = (models) => {
    Transport.hasMany(models.Route, {
      foreignKey: 'transport_id',
      as: 'routes'
    });
    Transport.hasMany(models.Booking, {
      foreignKey: 'transport_id',
      as: 'bookings'
    });
  };

  return Transport;
};



// module.exports = (sequelize, DataTypes) => {
//   const Transport = sequelize.define('Transport', {
//     type: {
//       type: DataTypes.ENUM('bus', 'plane', 'train', 'ship', 'boat'),
//       allowNull: false
//     },
//     identifier: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//       unique: true
//     },
//     name: {
//       type: DataTypes.STRING(100),
//       allowNull: false
//     },
//     operator: {
//       type: DataTypes.STRING(100),
//       allowNull: true
//     },
//     total_seats: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       validate: {
//         min: 1
//       }
//     },
//     seat_layout: {
//       type: DataTypes.JSON,
//       allowNull: false
//     },
//     amenities: {
//       type: DataTypes.JSON,
//       allowNull: true
//     }
//   }, {
//     timestamps: true,
//     createdAt: 'created_at',
//     updatedAt: 'updated_at',
//     tableName: 'transports'
//   });

//   return Transport;
// };
// // *********************



// class Transport {
//   constructor({
//     id,
//     type,
//     identifier,
//     name,
//     operator,
//     total_seats,
//     seat_layout,
//     amenities,
//     created_at,
//     updated_at
//   }) {
//     this.id = id;
//     this.type = type;
//     this.identifier = identifier;
//     this.name = name;
//     this.operator = operator;
//     this.totalSeats = total_seats;
//     this.seatLayout = seat_layout;
//     this.amenities = amenities;
//     this.createdAt = created_at;
//     this.updatedAt = updated_at;
//   }

//   static fromJson(json) {
//     return new Transport({
//       ...json,
//       seat_layout: typeof json.seat_layout === 'string' 
//         ? JSON.parse(json.seat_layout) 
//         : json.seat_layout,
//       amenities: typeof json.amenities === 'string' 
//         ? JSON.parse(json.amenities) 
//         : json.amenities
//     });
//   }

//   toJson() {
//     return {
//       id: this.id,
//       type: this.type,
//       identifier: this.identifier,
//       name: this.name,
//       operator: this.operator,
//       total_seats: this.totalSeats,
//       seat_layout: JSON.stringify(this.seatLayout),
//       amenities: JSON.stringify(this.amenities),
//       created_at: this.createdAt,
//       updated_at: this.updatedAt
//     };
//   }
// }

// module.exports = Transport;