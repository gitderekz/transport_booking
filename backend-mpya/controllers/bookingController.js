const { Booking, Route, Transport, Stop, BookedSeat, sequelize, Sequelize, Op } = require('../models');
const { generateBookingReference } = require('../utils/helpers');

// Helper function to flatten booking response
const flattenBookingResponse = (booking) => {
  if (!booking) return null;
  
  return {
    ...booking,
    origin: booking.route?.origin,
    destination: booking.route?.destination,
    base_price: booking.route?.base_price,
    transport_type: booking.transport?.type,
    transport_name: booking.transport?.name,
    pickup_station_name: booking.pickup_stop?.station_name,
    pickup_time: booking.pickup_stop?.departure_time,
    dropoff_station_name: booking.dropoff_stop?.station_name,
    dropoff_time: booking.dropoff_stop?.arrival_time,
    // // Remove nested objects to match original structure
    // route: undefined,
    // transport: undefined,
    // pickup_stop: undefined,
    // dropoff_stop: undefined
  };
};

module.exports = {
  createBooking: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { userId } = req.user;
      const { routeId, transportId, pickupStopId, dropoffStopId, seats, payment_method, notes } = req.body;

      // Validate route and stops
      const route = await Route.findOne({
        where: { id: routeId, transport_id: transportId },
        include: [
          { model: Transport, as: 'transport', attributes: ['type', 'name', 'total_seats', 'seat_layout'] },
          { model: Stop, as: 'stops', attributes: ['id', 'sequence_order'] }
        ],
        transaction: t
      });
      
      if (!route) {
        await t.rollback();
        return res.status(404).json({ success: false, error: 'Route not found' });
      }
      
      // Validate stops belong to the route
      const stops = await Stop.findAll({
        where: { 
          route_id: routeId,
          id: { [Op.in]: [pickupStopId, dropoffStopId] }
        },
        transaction: t
      });
      
      if (stops.length !== 2) {
        await t.rollback();
        return res.status(400).json({ success: false, error: 'Invalid pickup or dropoff stop' });
      }
      
      const pickupStop = stops.find(s => s.id == pickupStopId);
      const dropoffStop = stops.find(s => s.id == dropoffStopId);
      
      if (pickupStop.sequence_order >= dropoffStop.sequence_order) {
        await t.rollback();
        return res.status(400).json({ success: false, error: 'Pickup must be before dropoff' });
      }
      
      // Validate seats
      const seatNumbers = seats.map(s => s.seat_number);
      
      if (!seatNumbers.length) {
        await t.rollback();
        return res.status(400).json({ success: false, error: 'No seats provided' });
      }

      const existingBookings = await BookedSeat.findAll({
        attributes: ['seat_number'],
        where: {
          seat_number: { [Op.in]: seatNumbers },
          '$booking.route_id$': routeId,
          '$booking.status$': { [Op.in]: ['confirmed', 'pending'] }
        },
        include: [{
          model: Booking,
          as: 'booking',
          attributes: []
        }],
        transaction: t,
        raw: true
      });
      
      if (existingBookings.length > 0) {
        await t.rollback();
        return res.status(409).json({ 
          success: false,
          error: 'Some seats are already booked',
          bookedSeats: existingBookings.map(b => b.seat_number)
        });
      }
      
      // Calculate price
      const totalPrice = route.base_price * seats.length;
      
      // Create booking
      const booking = await Booking.create({
        booking_reference: generateBookingReference(),
        user_id: userId,
        route_id: routeId,
        transport_id: transportId,
        pickup_stop_id: pickupStopId,
        dropoff_stop_id: dropoffStopId,
        payment_method: payment_method || 'mpesa',
        notes: notes || 'Payment',
        total_price: totalPrice,
        status: 'pending',
        payment_status: 'unpaid'
      }, { transaction: t });
      
      // Book seats
      await BookedSeat.bulkCreate(
        seats.map(seat => ({
          booking_id: booking.id,
          seat_number: seat.seat_number,
          passenger_name: seat.passenger_name,
          passenger_age: seat.passenger_age,
          passenger_gender: seat.passenger_gender
        })),
        { transaction: t }
      );
      
      // Get full booking details with associations
      const fullBooking = await Booking.findByPk(booking.id, {
        include: [
          { 
            model: Route, 
            as: 'route',
            attributes: ['origin', 'destination', 'base_price']
          },
          { 
            model: Transport, 
            as: 'transport',
            attributes: ['type', 'name']
          },
          { 
            model: Stop, 
            as: 'pickup_stop',
            attributes: ['station_name', 'departure_time']
          },
          { 
            model: Stop, 
            as: 'dropoff_stop',
            attributes: ['station_name', 'arrival_time']
          },
          { 
            model: BookedSeat, 
            as: 'seats',
            attributes: ['seat_number', 'passenger_name', 'passenger_age', 'passenger_gender']
          }
        ],
        transaction: t,
        raw: true,
        nest: true
      });

      await t.commit();
      
      const flattenedBooking = flattenBookingResponse(fullBooking);
      
      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        booking: flattenedBooking,
        seatsBooked: seats.length
      });
    } catch (error) {
      await t.rollback();
      console.error('Booking error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  getUserBookings: async (req, res) => {
    try {
      const { userId } = req.user;
      
      const bookings = await Booking.findAll({
        where: { user_id: userId },
        include: [
          { 
            model: Route, 
            as: 'route',
            attributes: ['origin', 'destination', 'base_price']
          },
          { 
            model: Transport, 
            as: 'transport',
            attributes: ['type', 'name']
          },
          { 
            model: Stop, 
            as: 'pickup_stop',
            attributes: ['station_name', 'departure_time']
          },
          { 
            model: Stop, 
            as: 'dropoff_stop',
            attributes: ['station_name', 'arrival_time']
          },
          { 
            model: BookedSeat, 
            as: 'seats',
            attributes: ['seat_number', 'passenger_name', 'passenger_age', 'passenger_gender']
          }
        ],
        order: [['created_at', 'DESC']],
        raw: true,
        nest: true
      });
      
      const flattenedBookings = bookings.map(flattenBookingResponse);
      console.log('bookings:', bookings);
      
      res.json({ 
        success: true,
        data: flattenedBookings 
      });
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  getBookingDetails: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.user;
      
      const booking = await Booking.findOne({
        where: { id, user_id: userId },
        include: [
          { 
            model: Route, 
            as: 'route',
            attributes: ['origin', 'destination', 'base_price']
          },
          { 
            model: Transport, 
            as: 'transport',
            attributes: ['type', 'name']
          },
          { 
            model: Stop, 
            as: 'pickup_stop',
            attributes: ['station_name', 'departure_time']
          },
          { 
            model: Stop, 
            as: 'dropoff_stop',
            attributes: ['station_name', 'arrival_time']
          },
          { 
            model: BookedSeat, 
            as: 'seats',
            attributes: ['seat_number', 'passenger_name', 'passenger_age', 'passenger_gender']
          }
        ],
        raw: true,
        nest: true
      });
      
      if (!booking) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }
      
      const flattenedBooking = flattenBookingResponse(booking);
      res.json({ 
        success: true,
        data: flattenedBooking 
      });
    } catch (error) {
      console.error('Error fetching booking details:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  cancelBooking: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { userId } = req.user;

      const [updated] = await Booking.update(
        { status: 'cancelled' },
        { 
          where: { id, user_id: userId },
          transaction: t
        }
      );

      if (updated === 0) {
        await t.rollback();
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }

      await t.commit();
      res.json({ 
        success: true,
        message: 'Booking cancelled successfully' 
      });
    } catch (error) {
      await t.rollback();
      console.error('Error cancelling booking:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
};



// const { Booking, Route, Transport, Stop, BookedSeat , sequelize, Sequelize, Op } = require('../models');
// const { generateBookingReference } = require('../utils/helpers');

// module.exports = {
//   createBooking: async (req, res) => {
//     const t = await sequelize.transaction();
//     try {
//       const { userId } = req.user;
//       const { routeId, transportId, pickupStopId, dropoffStopId, seats, payment_method, notes } = req.body;

//       // Validate route and stops
//       const route = await Route.findOne({
//         where: { id: routeId, transport_id: transportId },
//         include: [
//           { model: Transport, as: 'transport' },
//           { model: Stop, as: 'stops' }
//         ],
//         transaction: t
//       });
      
//       if (!route) {
//         await t.rollback();
//         return res.status(404).json({ error: 'Route not found' });
//       }
      
//       // Validate stops belong to the route
//       const stops = await Stop.findAll({
//         where: { 
//           route_id: routeId,
//           id: [pickupStopId, dropoffStopId]
//         },
//         transaction: t
//       });
      
//       if (stops.length !== 2) {
//         await t.rollback();
//         return res.status(400).json({ error: 'Invalid pickup or dropoff stop' });
//       }
      
//       const pickupStop = stops.find(s => s.id == pickupStopId);
//       const dropoffStop = stops.find(s => s.id == dropoffStopId);
      
//       if (pickupStop.sequence_order >= dropoffStop.sequence_order) {
//         await t.rollback();
//         return res.status(400).json({ error: 'Pickup must be before dropoff' });
//       }
      
//       // Validate seats
//       const seatNumbers = seats.map(s => s.seat_number);
      
//       if (!seatNumbers.length) {
//         await t.rollback();
//         return res.status(400).json({ error: 'No seats provided' });
//       }

//       const existingBookings = await BookedSeat.findAll({
//         where: {
//           seat_number: seatNumbers,
//           '$booking.route_id$': routeId,
//           '$booking.status$': ['confirmed', 'pending']
//         },
//         include: [{
//           model: Booking,
//           as: 'booking',
//           attributes: []
//         }],
//         transaction: t
//       });
      
//       if (existingBookings.length > 0) {
//         await t.rollback();
//         return res.status(409).json({ 
//           error: 'Some seats are already booked',
//           bookedSeats: existingBookings.map(b => b.seat_number)
//         });
//       }
      
//       // Calculate price
//       const totalPrice = route.base_price * seats.length;
      
//       // Create booking
//       const booking = await Booking.create({
//         booking_reference: generateBookingReference(),
//         user_id: userId,
//         route_id: routeId,
//         transport_id: transportId,
//         pickup_stop_id: pickupStopId,
//         dropoff_stop_id: dropoffStopId,
//         payment_method,
//         notes,
//         total_price: totalPrice
//       }, { transaction: t });
      
//       // Book seats
//       await BookedSeat.bulkCreate(
//         seats.map(seat => ({
//           booking_id: booking.id,
//           seat_number: seat.seat_number,
//           passenger_name: seat.passenger_name,
//           passenger_age: seat.passenger_age,
//           passenger_gender: seat.passenger_gender
//         })),
//         { transaction: t }
//       );
      
//       await t.commit();
      
//       // Get full booking details with associations
//       const fullBooking = await Booking.findByPk(booking.id, {
//         include: [
//           { model: Route, as: 'route' },
//           { model: Transport, as: 'transport' },
//           { 
//             model: Stop, 
//             as: 'pickup_stop',
//             attributes: ['id', 'station_name', 'departure_time']
//           },
//           { 
//             model: Stop, 
//             as: 'dropoff_stop',
//             attributes: ['id', 'station_name', 'arrival_time']
//           },
//           { model: BookedSeat, as: 'seats' },
//           {
//             model: Route,
//             as: 'route',
//             include: [{
//               model: Stop,
//               as: 'stops',
//               attributes: ['id', 'station_name', 'sequence_order', 'arrival_time', 'departure_time'],
//               order: [['sequence_order', 'ASC']]
//             }]
//           }
//         ],
//         transaction: t
//       });

//       res.status(201).json({
//         message: 'Booking created successfully',
//         booking: fullBooking,
//         seatsBooked: seats.length
//       });
//     } catch (error) {
//       await t.rollback();
//       console.error('Booking error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   },

//   getUserBookings: async (req, res) => {
//     try {
//       const { userId } = req.user;
      
//       const bookings = await Booking.findAll({
//         where: { user_id: userId },
//         include: [
//           { 
//             model: Route, 
//             as: 'route',
//             attributes: ['origin', 'destination', 'base_price', 'duration_minutes']
//           },
//           { 
//             model: Transport, 
//             as: 'transport',
//             attributes: ['type', 'name']
//           },
//           { 
//             model: Stop, 
//             as: 'pickup_stop',
//             attributes: ['station_name', 'departure_time']
//           },
//           { 
//             model: Stop, 
//             as: 'dropoff_stop',
//             attributes: ['station_name', 'arrival_time']
//           },
//           { 
//             model: BookedSeat, 
//             as: 'seats',
//             attributes: ['seat_number', 'passenger_name', 'passenger_age', 'passenger_gender']
//           }
//         ],
//         order: [['created_at', 'DESC']]
//       });
//       console.log('bookings',bookings);
      
//       res.json({ data: bookings });
//     } catch (error) {
//       console.error('Error fetching user bookings:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   },

//   getBookingDetails: async (req, res) => {
//     try {
//       const { id } = req.params;
//       const { userId } = req.user;
      
//       const booking = await Booking.findOne({
//         where: { id, user_id: userId },
//         include: [
//           { 
//             model: Route, 
//             as: 'route',
//             attributes: ['origin', 'destination', 'base_price', 'duration_minutes']
//           },
//           { 
//             model: Transport, 
//             as: 'transport',
//             attributes: ['type', 'name']
//           },
//           { 
//             model: Stop, 
//             as: 'pickup_stop',
//             attributes: ['station_name', 'departure_time']
//           },
//           { 
//             model: Stop, 
//             as: 'dropoff_stop',
//             attributes: ['station_name', 'arrival_time']
//           },
//           { 
//             model: BookedSeat, 
//             as: 'seats',
//             attributes: ['seat_number', 'passenger_name', 'passenger_age', 'passenger_gender']
//           }
//         ]
//       });
      
//       if (!booking) {
//         return res.status(404).json({ error: 'Booking not found' });
//       }
      
//       res.json(booking);
//     } catch (error) {
//       console.error('Error fetching booking details:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   },

//   cancelBooking: async (req, res) => {
//     const t = await sequelize.transaction();
//     try {
//       const { id } = req.params;
//       const { userId } = req.user;

//       // Check if booking belongs to user and update status
//       const [updated] = await Booking.update(
//         { status: 'cancelled' },
//         { 
//           where: { id, user_id: userId },
//           transaction: t
//         }
//       );

//       if (updated === 0) {
//         await t.rollback();
//         return res.status(404).json({ error: 'Booking not found' });
//       }

//       await t.commit();
//       res.json({ message: 'Booking cancelled successfully' });
//     } catch (error) {
//       await t.rollback();
//       console.error('Error cancelling booking:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// };
// // *************************



// const { pool } = require('../config/db');
// const { generateBookingReference } = require('../utils/helpers');

// module.exports = {
//   createBooking: async (req, res) => {
//     const connection = await pool.getConnection();
//     try {
//       // 1. Set the GROUP_CONCAT max length
//       await connection.query('SET SESSION group_concat_max_len = 1000000');
//       await connection.beginTransaction();
      
//       const { userId } = req.user;


//       let { routeId, transportId, pickupStopId, dropoffStopId, seats,payment_method,notes} = req.body;
//       console.log('PAR',routeId, transportId, pickupStopId, dropoffStopId, seats,payment_method,notes);


//       // Validate route and stops
//       const [route] = await connection.execute(
//         `SELECT r.*, t.type, t.name as transport_name, t.total_seats, t.seat_layout
//          FROM routes r
//          JOIN transports t ON r.transport_id = t.id
//          WHERE r.id = ? AND r.transport_id = ?`,
//         [routeId, transportId]
//       );
      
//       if (route.length === 0) {
//         await connection.rollback();
//         return res.status(404).json({ error: 'Route not found' });
//       }
      
//       // Validate stops belong to the route
//       const [stops] = await connection.execute(
//         'SELECT id, sequence_order FROM stops WHERE route_id = ? AND id IN (?, ?)',
//         [routeId, pickupStopId, dropoffStopId]
//       );
      
//       if (stops.length !== 2) {
//         await connection.rollback();
//         return res.status(400).json({ error: 'Invalid pickup or dropoff stop' });
//       }
      
//       const pickupStop = stops.find(s => s.id == pickupStopId);
//       const dropoffStop = stops.find(s => s.id == dropoffStopId);
      
//       if (pickupStop.sequence_order >= dropoffStop.sequence_order) {
//         await connection.rollback();
//         return res.status(400).json({ error: 'Pickup must be before dropoff' });
//       }
      
//       //// Validate seats
//       //const seatNumbers = seats.map(s => s.seatNumber);
//       //const [existingBookings] = await connection.execute(
//       //  `SELECT bs.seat_number 
//       //   FROM booked_seats bs
//       //   JOIN bookings b ON bs.booking_id = b.id
//       //   WHERE b.route_id = ? AND b.status IN ('confirmed', 'pending')
//       //   AND bs.seat_number IN (?)`,
//       //  [routeId, seatNumbers]
//       //);
// const seatNumbers = seats.map(s => s.seat_number);

// // Guard: prevent empty list crash
// if (!seatNumbers.length) {
//   await connection.rollback();
//   return res.status(400).json({ error: 'No seats provided' });
// }

// // Dynamically build placeholders
// const seatPlaceholders = seatNumbers.map(() => '?').join(', ');

// const [existingBookings] = await connection.execute(
//   `SELECT bs.seat_number 
//    FROM booked_seats bs
//    JOIN bookings b ON bs.booking_id = b.id
//    WHERE b.route_id = ? AND b.status IN ('confirmed', 'pending')
//    AND bs.seat_number IN (${seatPlaceholders})`,
//   [routeId, ...seatNumbers] // ✅ spread seat numbers
// );

      
//       if (existingBookings.length > 0) {
//         await connection.rollback();
//         return res.status(409).json({ 
//           error: 'Some seats are already booked',
//           bookedSeats: existingBookings.map(b => b.seat_number)
//         });
//       }
      
//       // Calculate price (simplified - you'd implement proper pricing logic)
//       const basePrice = route[0].base_price;
//       const totalPrice = basePrice * seats.length;
      
//       // Create booking
//       const bookingRef = generateBookingReference();

//       const [bookingResult] = await connection.execute(
//         `INSERT INTO bookings (
//           booking_reference, user_id, route_id, transport_id, 
//           pickup_stop_id, dropoff_stop_id,payment_method,notes, total_price
//         ) VALUES (?, ?, ?, ?, ?, ?, ?,?,?)`,
//         [bookingRef, userId, routeId, transportId, pickupStopId, dropoffStopId,payment_method,notes, totalPrice]
//       );
      
//       const bookingId = bookingResult.insertId;
      
//       //// Book seats
//       //for (const seat of seats) {
//       //  await connection.execute(
//       //    `INSERT INTO booked_seats (
//       //      booking_id, seat_number, passenger_name, passenger_age, passenger_gender
//       //    ) VALUES (?, ?, ?, ?, ?)`,
//       //    [bookingId, seat.seatNumber, seat.passengerName, seat.passengerAge, seat.passengerGender]
//       //  );
//       //}
// for (const seat of seats) {
//   const seatNumber = seat.seat_number ?? null;
//   const passengerName = seat.passenger_name ?? null;
//   const passengerAge = seat.passenger_age ?? null;
//   const passengerGender = seat.passenger_gender ?? null;

//   if (!seatNumber || !passengerName) {
//     await connection.rollback();
//     return res.status(400).json({ error: 'Missing seat number or passenger name' });
//   }

//   await connection.execute(
//     `INSERT INTO booked_seats (
//       booking_id, seat_number, passenger_name, passenger_age, passenger_gender
//     ) VALUES (?, ?, ?, ?, ?)`,
//     [bookingId, seatNumber, passengerName, passengerAge, passengerGender]
//   );
// }

      
//       await connection.commit();
      
//       // Get full booking details
// const [booking] = await pool.execute(
//   `SELECT 
//     b.*,
//     r.origin, r.destination, r.base_price, r.duration_minutes,
//     t.type as transport_type, t.name as transport_name,
//     ps.station_name as pickup_station_name, ps.departure_time as pickup_time,
//     ds.station_name as dropoff_station_name, ds.arrival_time as dropoff_time,
//     (
//   SELECT CONCAT('[', GROUP_CONCAT(
//     JSON_OBJECT(
//       'id', s.id,
//       'station_name', s.station_name,
//       'sequence_order', s.sequence_order,
//       'arrival_time', s.arrival_time,
//       'departure_time', s.departure_time
//     )
//     ORDER BY s.sequence_order
//   ), ']')
//   FROM stops s
//   WHERE s.route_id = r.id
// ) as stops,
//     (
//   SELECT CONCAT('[', GROUP_CONCAT(
//     JSON_OBJECT(
//       'seat_number', bs.seat_number,
//       'passenger_name', bs.passenger_name,
//       'passenger_age', bs.passenger_age,
//       'passenger_gender', bs.passenger_gender
//     )
//   ), ']')
//   FROM booked_seats bs
//   WHERE bs.booking_id = b.id
// ) as seats
//    FROM bookings b
//    JOIN routes r ON b.route_id = r.id
//    JOIN transports t ON b.transport_id = t.id
//    JOIN stops ps ON b.pickup_stop_id = ps.id
//    JOIN stops ds ON b.dropoff_stop_id = ds.id
//    WHERE b.id = ?`,
//   [bookingId]
// );

// // Parse the JSON strings
// const bookingData = booking[0];
// if (bookingData.stops) {
//   bookingData.stops = JSON.parse(bookingData.stops);
// }
// if (bookingData.seats) {
//   bookingData.seats = JSON.parse(bookingData.seats);
// }
// console.log({
//   message: 'Booking created successfully',
//   booking: bookingData,
//   seatsBooked: seats.length
// });
// res.status(201).json({
//   message: 'Booking created successfully',
//   booking: bookingData,
//   seatsBooked: seats.length
// });
      
//       //res.status(201).json({
//       //  message: 'Booking created successfully',
//       //  booking: booking[0],
//       //  seatsBooked: seats.length
//       //});
//     } catch (error) {
//       await connection.rollback();
//       console.error('Booking error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     } finally {
//       connection.release();
//     }
//   },

//   getUserBookings: async (req, res) => {
//     try {
//       const { userId } = req.user;
      
//       const [bookings] = await pool.execute(
//   `SELECT b.*, 
//    r.origin, r.destination, r.base_price, r.duration_minutes,
//    t.type as transport_type, t.name as transport_name,
//    ps.station_name as pickup_station_name, ps.departure_time as pickup_time,
//    ds.station_name as dropoff_station_name, ds.arrival_time as dropoff_time
//    FROM bookings b
//    JOIN routes r ON b.route_id = r.id
//    JOIN transports t ON b.transport_id = t.id
//    JOIN stops ps ON b.pickup_stop_id = ps.id
//    JOIN stops ds ON b.dropoff_stop_id = ds.id
//    WHERE b.user_id = ?
//    ORDER BY b.created_at DESC`,
//   [userId]
// );

      
//       // Get booked seats for each booking
//       for (const booking of bookings) {
//         const [seats] = await pool.execute(
//           'SELECT * FROM booked_seats WHERE booking_id = ?',
//           [booking.id]
//         );
//         booking.seats = seats;
//       }
//       console.log('bookings',bookings);
//       res.json({ data: bookings });
//     } catch (error) {
//       console.error('Error fetching user bookings:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   },

//   getBookingDetails: async (req, res) => {
//     try {
//       const { id } = req.params;
//       const { userId } = req.user;
      
// const [bookings] = await pool.execute(
//   `SELECT b.*, 
//    r.origin, r.destination, r.base_price, r.duration_minutes,
//    t.type as transport_type, t.name as transport_name,
//    ps.station_name as pickup_station_name, ps.departure_time as pickup_time,
//    ds.station_name as dropoff_station_name, ds.arrival_time as dropoff_time
//    FROM bookings b
//    JOIN routes r ON b.route_id = r.id
//    JOIN transports t ON b.transport_id = t.id
//    JOIN stops ps ON b.pickup_stop_id = ps.id
//    JOIN stops ds ON b.dropoff_stop_id = ds.id
//    WHERE b.id = ? AND b.user_id = ?`,
//   [id, userId]
// );

      
//       if (bookings.length === 0) {
//         return res.status(404).json({ error: 'Booking not found' });
//       }
      
//       const [seats] = await pool.execute(
//         'SELECT * FROM booked_seats WHERE booking_id = ?',
//         [id]
//       );
      
//       const booking = bookings[0];
//       booking.seats = seats;
      
//       res.json(booking);
//     } catch (error) {
//       console.error('Error fetching booking details:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   },
//   cancelBooking: async (req, res) => {
//     const connection = await pool.getConnection();
//     try {
//       await connection.beginTransaction();
      
//       const { id } = req.params;
//       const { userId } = req.user;

//       // Check if booking belongs to user
//       const [bookings] = await connection.execute(
//         'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
//         [id, userId]
//       );

//       if (bookings.length === 0) {
//         await connection.rollback();
//         return res.status(404).json({ error: 'Booking not found' });
//       }

//       // Update status to cancelled instead of deleting
//       await connection.execute(
//         'UPDATE bookings SET status = "cancelled" WHERE id = ?',
//         [id]
//       );

//       await connection.commit();
//       res.json({ message: 'Booking cancelled successfully' });
//     } catch (error) {
//       await connection.rollback();
//       console.error('Error cancelling booking:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     } finally {
//       connection.release();
//     }
//   }
// };