module.exports = (sequelize, DataTypes) => {
  const BookedSeat = sequelize.define('BookedSeat', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'bookings',
        key: 'id'
      }
    },
    seat_number: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    passenger_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    passenger_age: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0
      }
    },
    passenger_gender: {
      type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
      allowNull: true
    }
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    tableName: 'booked_seats',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['booking_id', 'seat_number']
      },
      {
        fields: ['passenger_name', 'passenger_age']
      }
    ]
  });

  BookedSeat.associate = (models) => {
    BookedSeat.belongsTo(models.Booking, {
      foreignKey: 'booking_id',
      as: 'booking'
    });
  };

  return BookedSeat;
};



// module.exports = (sequelize, DataTypes) => {
//   const BookedSeat = sequelize.define('BookedSeat', {
//     seat_number: {
//       type: DataTypes.STRING(10),
//       allowNull: false
//     },
//     passenger_name: {
//       type: DataTypes.STRING(100),
//       allowNull: false
//     },
//     passenger_age: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//       validate: {
//         min: 0
//       }
//     },
//     passenger_gender: {
//       type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
//       allowNull: true
//     }
//   }, {
//     timestamps: true,
//     createdAt: 'created_at',
//     updatedAt: 'updated_at',
//     tableName: 'booked_seats',
//     indexes: [
//       {
//         unique: true,
//         fields: ['booking_id', 'seat_number']
//       }
//     ]
//   });

//   BookedSeat.associate = (models) => {
//     BookedSeat.belongsTo(models.Booking, {
//       foreignKey: 'booking_id',
//       as: 'booking'
//     });
//   };

//   return BookedSeat;
// };