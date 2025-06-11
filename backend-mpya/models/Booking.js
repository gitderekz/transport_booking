module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    booking_reference: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
      defaultValue: 'pending'
    },
    payment_status: {
      type: DataTypes.ENUM('unpaid', 'partial', 'paid', 'refunded'),
      defaultValue: 'unpaid'
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    // 👇 Add missing foreign keys
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    route_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'routes',
        key: 'id'
      }
    },
    transport_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'transports',
        key: 'id'
      }
    },
    pickup_stop_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'stops',
        key: 'id'
      }
    },
    dropoff_stop_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'stops',
        key: 'id'
      }
    }

  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    tableName: 'bookings'
  });

  Booking.associate = (models) => {
    Booking.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    Booking.belongsTo(models.Route, {
      foreignKey: 'route_id',
      as: 'route'
    });
    Booking.belongsTo(models.Transport, {
      foreignKey: 'transport_id',
      as: 'transport'
    });
    Booking.belongsTo(models.Stop, {
      foreignKey: 'pickup_stop_id',
      as: 'pickup_stop'
    });
    Booking.belongsTo(models.Stop, {
      foreignKey: 'dropoff_stop_id',
      as: 'dropoff_stop'
    });
    Booking.hasMany(models.BookedSeat, {
      foreignKey: 'booking_id',
      as: 'seats'
    });
  };

  return Booking;
};



// class Booking {
//   constructor({
//     id,
//     booking_reference,
//     user_id,
//     route_id,
//     transport_id,
//     pickup_stop_id,
//     dropoff_stop_id,
//     total_price,
//     status,
//     payment_status,
//     payment_method,
//     notes,
//     created_at,
//     updated_at
//   }) {
//     this.id = id;
//     this.bookingReference = booking_reference;
//     this.userId = user_id;
//     this.routeId = route_id;
//     this.transportId = transport_id;
//     this.pickupStopId = pickup_stop_id;
//     this.dropoffStopId = dropoff_stop_id;
//     this.totalPrice = total_price;
//     this.status = status;
//     this.paymentStatus = payment_status;
//     this.paymentMethod = payment_method;
//     this.notes = notes;
//     this.createdAt = created_at;
//     this.updatedAt = updated_at;
//   }

//   static fromJson(json) {
//     return new Booking(json);
//   }

//   toJson() {
//     return {
//       id: this.id,
//       booking_reference: this.bookingReference,
//       user_id: this.userId,
//       route_id: this.routeId,
//       transport_id: this.transportId,
//       pickup_stop_id: this.pickupStopId,
//       dropoff_stop_id: this.dropoffStopId,
//       total_price: this.totalPrice,
//       status: this.status,
//       payment_status: this.paymentStatus,
//       payment_method: this.paymentMethod,
//       notes: this.notes,
//       created_at: this.createdAt,
//       updated_at: this.updatedAt
//     };
//   }
// }

// module.exports = Booking;