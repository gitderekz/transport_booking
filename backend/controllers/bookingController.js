const { pool } = require('../config/db');
const { generateBookingReference } = require('../utils/helpers');

module.exports = {
  createBooking: async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const { id } = req.user;
let userId = id;
console.log('USER-ID',userId);
      const { routeId, transportId, pickupStopId, dropoffStopId, seats } = req.body;
      console.log('REQ: ', routeId, transportId, pickupStopId, dropoffStopId, seats);
      // Validate route and stops
      const [route] = await connection.execute(
        `SELECT r.*, t.type, t.name as transport_name, t.total_seats, t.seat_layout
         FROM routes r
         JOIN transports t ON r.transport_id = t.id
         WHERE r.id = ? AND r.transport_id = ?`,
        [routeId, transportId]
      );
      
      if (route.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Route not found' });
      }
      
      // Validate stops belong to the route
      const [stops] = await connection.execute(
        'SELECT id, sequence_order FROM stops WHERE route_id = ? AND id IN (?, ?)',
        [routeId, pickupStopId, dropoffStopId]
      );
      
      if (stops.length !== 2) {
        await connection.rollback();
        return res.status(400).json({ error: 'Invalid pickup or dropoff stop' });
      }
      
      const pickupStop = stops.find(s => s.id == pickupStopId);
      const dropoffStop = stops.find(s => s.id == dropoffStopId);
      
      if (pickupStop.sequence_order >= dropoffStop.sequence_order) {
        await connection.rollback();
        return res.status(400).json({ error: 'Pickup must be before dropoff' });
      }
      
      //// Validate seats
      //const seatNumbers = seats.map(s => s.seatNumber);
      //const [existingBookings] = await connection.execute(
      //  `SELECT bs.seat_number 
      //   FROM booked_seats bs
      //   JOIN bookings b ON bs.booking_id = b.id
      //   WHERE b.route_id = ? AND b.status IN ('confirmed', 'pending')
      //   AND bs.seat_number IN (?)`,
      //  [routeId, seatNumbers]
      //);
const seatNumbers = seats.map(s => s.seat_number);

// Guard: prevent empty list crash
if (!seatNumbers.length) {
  await connection.rollback();
  return res.status(400).json({ error: 'No seats provided' });
}

// Dynamically build placeholders
const seatPlaceholders = seatNumbers.map(() => '?').join(', ');

const [existingBookings] = await connection.execute(
  `SELECT bs.seat_number 
   FROM booked_seats bs
   JOIN bookings b ON bs.booking_id = b.id
   WHERE b.route_id = ? AND b.status IN ('confirmed', 'pending')
   AND bs.seat_number IN (${seatPlaceholders})`,
  [routeId, ...seatNumbers] // ✅ spread seat numbers
);

      
      if (existingBookings.length > 0) {
        await connection.rollback();
        return res.status(409).json({ 
          error: 'Some seats are already booked',
          bookedSeats: existingBookings.map(b => b.seat_number)
        });
      }
      
      // Calculate price (simplified - you'd implement proper pricing logic)
      const basePrice = route[0].base_price;
      const totalPrice = basePrice * seats.length;
      
      // Create booking
      const bookingRef = generateBookingReference();
console.log('bookingRef, userId, routeId, transportId, pickupStopId, dropoffStopId, totalPrice', bookingRef, userId, routeId, transportId, pickupStopId, dropoffStopId, totalPrice);
      const [bookingResult] = await connection.execute(
        `INSERT INTO bookings (
          booking_reference, user_id, route_id, transport_id, 
          pickup_stop_id, dropoff_stop_id, total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [bookingRef, userId, routeId, transportId, pickupStopId, dropoffStopId, totalPrice]
      );
      
      const bookingId = bookingResult.insertId;
      
      //// Book seats
      //for (const seat of seats) {
      //  await connection.execute(
      //    `INSERT INTO booked_seats (
      //      booking_id, seat_number, passenger_name, passenger_age, passenger_gender
      //    ) VALUES (?, ?, ?, ?, ?)`,
      //    [bookingId, seat.seatNumber, seat.passengerName, seat.passengerAge, seat.passengerGender]
      //  );
      //}
for (const seat of seats) {
  const seatNumber = seat.seat_number ?? null;
  const passengerName = seat.passenger_name ?? null;
  const passengerAge = seat.passenger_age ?? null;
  const passengerGender = seat.passenger_gender ?? null;

  if (!seatNumber || !passengerName) {
    await connection.rollback();
    return res.status(400).json({ error: 'Missing seat number or passenger name' });
  }

  await connection.execute(
    `INSERT INTO booked_seats (
      booking_id, seat_number, passenger_name, passenger_age, passenger_gender
    ) VALUES (?, ?, ?, ?, ?)`,
    [bookingId, seatNumber, passengerName, passengerAge, passengerGender]
  );
}

      
      await connection.commit();
      
      // Get full booking details
      const [booking] = await pool.execute(
        `SELECT b.*, 
         r.origin, r.destination, r.base_price,
         t.type as transport_type, t.name as transport_name,
         ps.station_name as pickup_station_name, ps.departure_time as pickup_time,
         ds.station_name as dropoff_station_name, ds.arrival_time as dropoff_time
         FROM bookings b
         JOIN routes r ON b.route_id = r.id
         JOIN transports t ON b.transport_id = t.id
         JOIN stops ps ON b.pickup_stop_id = ps.id
         JOIN stops ds ON b.dropoff_stop_id = ds.id
         WHERE b.id = ?`,
        [bookingId]
      );
      
      res.status(201).json({
        message: 'Booking created successfully',
        booking: booking[0],
        seatsBooked: seats.length
      });
    } catch (error) {
      await connection.rollback();
      console.error('Booking error:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      connection.release();
    }
  },

  getUserBookings: async (req, res) => {
    try {
      const { userId } = req.user;
      
      const [bookings] = await pool.execute(
        `SELECT b.*, 
         r.origin, r.destination, r.base_price,
         t.type as transport_type, t.name as transport_name,
         ps.station_name as pickup_station_name, ps.departure_time as pickup_time,
         ds.station_name as dropoff_station_name, ds.arrival_time as dropoff_time
         FROM bookings b
         JOIN routes r ON b.route_id = r.id
         JOIN transports t ON b.transport_id = t.id
         JOIN stops ps ON b.pickup_stop_id = ps.id
         JOIN stops ds ON b.dropoff_stop_id = ds.id
         WHERE b.user_id = ?
         ORDER BY b.created_at DESC`,
        [userId]
      );
      
      // Get booked seats for each booking
      for (const booking of bookings) {
        const [seats] = await pool.execute(
          'SELECT * FROM booked_seats WHERE booking_id = ?',
          [booking.id]
        );
        booking.seats = seats;
      }
      
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getBookingDetails: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.user;
      
      const [bookings] = await pool.execute(
        `SELECT b.*, 
         r.origin, r.destination, r.base_price,
         t.type as transport_type, t.name as transport_name,
         ps.station_name as pickup_station_name, ps.departure_time as pickup_time,
         ds.station_name as dropoff_station_name, ds.arrival_time as dropoff_time
         FROM bookings b
         JOIN routes r ON b.route_id = r.id
         JOIN transports t ON b.transport_id = t.id
         JOIN stops ps ON b.pickup_stop_id = ps.id
         JOIN stops ds ON b.dropoff_stop_id = ds.id
         WHERE b.id = ? AND b.user_id = ?`,
        [id, userId]
      );
      
      if (bookings.length === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      
      const [seats] = await pool.execute(
        'SELECT * FROM booked_seats WHERE booking_id = ?',
        [id]
      );
      
      const booking = bookings[0];
      booking.seats = seats;
      
      res.json(booking);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};