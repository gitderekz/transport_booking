const { Transport, Route, Booking , Stop, sequelize, Sequelize, Op } = require('../models');

module.exports = {
  getAllTransports: async (req, res) => {
    try {
      const { type } = req.query;
      
      const where = {};
      if (type) {
        where.type = type;
      }
      
      const transports = await Transport.findAll({ where });
      
      res.json({ success: true, data: transports });
    } catch (error) {
      console.error('Error fetching transports:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getTransportById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const transport = await Transport.findByPk(id);
      
      if (!transport) {
        return res.status(404).json({ error: 'Transport not found' });
      }
      
      res.json(transport);
    } catch (error) {
      console.error('Error fetching transport:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getRoutes: async (req, res) => {
    try {
      const { from, to, date } = req.query;
      
      if (!from || !to) {
        return res.status(400).json({ error: 'Origin and destination are required' });
      }
      
      const routes = await Route.findAll({
        where: { 
          origin: from,
          destination: to,
          active: true
        },
        include: [{
          model: Transport,
          as: 'transport',
          attributes: ['type', 'name', 'total_seats', 'seat_layout']
        }]
      });
      
      // Get stops for each route
      for (const route of routes) {
        const stops = await Stop.findAll({
          where: { route_id: route.id },
          order: [['sequence_order', 'ASC']]
        });
        route.dataValues.stops = stops;
      }
      
      res.json({ success: true, data: routes });
    } catch (error) {
      console.error('Error fetching routes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getRouteStops: async (req, res) => {
    try {
      const { id } = req.params;
      
      const stops = await Stop.findAll({
        where: { route_id: id },
        order: [['sequence_order', 'ASC']]
      });
      
      if (!stops.length) {
        return res.status(404).json({ error: 'No stops found for this route' });
      }
      
      res.json(stops);
    } catch (error) {
      console.error('Error fetching route stops:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getAvailableSeats: async (req, res) => {
    try {
      const { routeId, transportId } = req.params;
      
      // Validate route and transport
      const route = await Route.findOne({
        where: { id: routeId, transport_id: transportId }
      });
      
      if (!route) {
        return res.status(404).json({ error: 'Route not found' });
      }
      
      // Get transport seat layout
      const transport = await Transport.findByPk(transportId);
      if (!transport) {
        return res.status(404).json({ error: 'Transport not found' });
      }
      
      // Get all booked seats for this route
      const bookedSeats = await BookedSeat.findAll({
        include: [{
          model: Booking,
          as: 'booking',
          where: { 
            route_id: routeId,
            status: ['confirmed', 'pending']
          },
          attributes: []
        }],
        attributes: ['seat_number'],
        raw: true
      });
      
      const bookedSeatNumbers = bookedSeats.map(s => s.seat_number);
      
      // Get available seats by filtering out booked seats from transport's seat layout
      const seatLayout = transport.seat_layout;
      const availableSeats = [];
      
      // Assuming seat_layout is a 2D array of seat objects
      for (const row of seatLayout) {
        for (const seat of row) {
          if (seat && !bookedSeatNumbers.includes(seat.number)) {
            availableSeats.push(seat.number);
          }
        }
      }
      
      res.json(availableSeats);
    } catch (error) {
      console.error('Error fetching available seats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};



// const { pool } = require('../config/db');

// module.exports = {
//   getAllTransports: async (req, res) => {
//     try {
//       const { type } = req.query;
//       let query = 'SELECT * FROM transports';
//       const params = [];
      
//       if (type) {
//         query += ' WHERE type = ?';
//         params.push(type);
//       }
      
//       const [transports] = await pool.execute(query, params);
//       console.log('Transport: ',transports);
//       res.json({ success: true, data: transports });

//     } catch (error) {
//       console.error('Error fetching transports:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   },

//   getTransportById: async (req, res) => {
//     try {
//       const { id } = req.params;
//       const [transports] = await pool.execute(
//         'SELECT * FROM transports WHERE id = ?',
//         [id]
//       );
      
//       if (transports.length === 0) {
//         return res.status(404).json({ error: 'Transport not found' });
//       }
      
//       res.json(transports[0]);
//     } catch (error) {
//       console.error('Error fetching transport:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   },

//   getRoutes: async (req, res) => {
//     try {
//       const { from, to, date } = req.query;
      
//       if (!from || !to) {
//         return res.status(400).json({ error: 'Origin and destination are required' });
//       }
      
//       // Basic route search - you'd enhance this with date filtering
//       const [routes] = await pool.execute(
//         `SELECT r.*, t.type, t.name as transport_name, t.total_seats, t.seat_layout
//          FROM routes r
//          JOIN transports t ON r.transport_id = t.id
//          WHERE r.origin = ? AND r.destination = ? AND r.active = TRUE`,
//         [from, to]
//       );
      
//       // Get stops for each route
//       for (const route of routes) {
//         const [stops] = await pool.execute(
//           'SELECT * FROM stops WHERE route_id = ? ORDER BY sequence_order',
//           [route.id]
//         );
//         route.stops = stops;
//       }
      
//       res.json({ success: true, data: routes });
//     } catch (error) {
//       console.error('Error fetching routes:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   },

//   getRouteStops: async (req, res) => {
//     try {
//       const { id } = req.params;
//       const [stops] = await pool.execute(
//         'SELECT * FROM stops WHERE route_id = ? ORDER BY sequence_order',
//         [id]
//       );
      
//       if (stops.length === 0) {
//         return res.status(404).json({ error: 'No stops found for this route' });
//       }
      
//       res.json(stops);
//     } catch (error) {
//       console.error('Error fetching route stops:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   },

//   getAvailableSeats: async (req, res) => {
//     try {
//       const { routeId, transportId } = req.params;
      
//       // Validate route and transport
//       const [route] = await pool.execute(
//         'SELECT * FROM routes WHERE id = ? AND transport_id = ?',
//         [routeId, transportId]
//       );
      
//       if (route.length === 0) {
//         return res.status(404).json({ error: 'Route not found' });
//       }
      
//       // Get available seats using the view we created
//       const [seats] = await pool.execute(
//         'SELECT seat_number FROM available_seats WHERE route_id = ? AND transport_id = ?',
//         [routeId, transportId]
//       );
      
//       res.json(seats.map(s => s.seat_number));
//     } catch (error) {
//       console.error('Error fetching available seats:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// };