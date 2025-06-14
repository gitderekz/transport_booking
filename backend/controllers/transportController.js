const { pool } = require('../config/db');

const arrangeSeatsInLayout = (layout, bookedSeatDetails = []) => {
  const rows = layout?.rows || 0;
  const columns = layout?.columns || 0;
  const seatMatrix = [];

  for (let r = 1; r <= rows; r++) {
    const rowSeats = [];

    for (let c = 0; c < columns; c++) {
      const letter = String.fromCharCode(65 + c);
      const seatNum = `${r}${letter}`;

      const booked = bookedSeatDetails.find(s => s.seat_number === seatNum);

      rowSeats.push({
        seat_number: seatNum,
        booked: !!booked,
        passenger_name: booked?.passenger_name || null,
        passenger_gender: booked?.passenger_gender || null,
        pickup_stop_name: booked?.pickup_stop_name || null,
        dropoff_stop_name: booked?.dropoff_stop_name || null
      });
    }

    seatMatrix.push(rowSeats);
  }

  return seatMatrix;
};

const getBookedSeatDetails = async (transportId, routeId = null) => {
  const query = `
    SELECT 
      bs.seat_number,
      bs.passenger_name,
      bs.passenger_gender,
      p_stop.station_name AS pickup_stop_name,
      d_stop.station_name AS dropoff_stop_name
    FROM booked_seats bs
    JOIN bookings b ON bs.booking_id = b.id
    LEFT JOIN stops p_stop ON b.pickup_stop_id = p_stop.id
    LEFT JOIN stops d_stop ON b.dropoff_stop_id = d_stop.id
    WHERE b.transport_id = ?
    ${routeId ? 'AND b.route_id = ?' : ''}
  `;
  const params = routeId ? [transportId, routeId] : [transportId];
  const [rows] = await pool.execute(query, params);
  return rows;
};

module.exports = {

  getAllTransports: async (req, res) => {
    try {
      const { type } = req.query;
      let query = 'SELECT * FROM transports';
      const params = [];

      if (type) {
        query += ' WHERE type = ?';
        params.push(type);
      }

      const [transports] = await pool.execute(query, params);

      const formatted = await Promise.all(transports.map(async t => {
        const layout = t.seat_layout ? JSON.parse(t.seat_layout) : null;
        const bookedSeats = await getBookedSeatDetails(t.id);

        return {
          ...t,
          seat_layout: layout,
          seat_arrangement: layout ? arrangeSeatsInLayout(layout, bookedSeats) : [],
          amenities: t.amenities ? JSON.parse(t.amenities) : null
        };
      }));

      res.json({ success: true, data: formatted });
    } catch (error) {
      console.error('Error fetching transports:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch transports' });
    }
  },

  getTransportById: async (req, res) => {
    try {
      const { id } = req.params;
      const [transports] = await pool.execute('SELECT * FROM transports WHERE id = ?', [id]);

      if (transports.length === 0) {
        return res.status(404).json({ success: false, error: 'Transport not found' });
      }

      const transport = transports[0];
      const layout = transport.seat_layout ? JSON.parse(transport.seat_layout) : null;
      const bookedSeats = await getBookedSeatDetails(id);

      transport.seat_layout = layout;
      transport.seat_arrangement = layout ? arrangeSeatsInLayout(layout, bookedSeats) : [];
      transport.amenities = transport.amenities ? JSON.parse(transport.amenities) : null;

      res.json({ success: true, data: transport });
    } catch (error) {
      console.error('Error fetching transport:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch transport' });
    }
  },

  getRoutes: async (req, res) => {
    try {
      const { from, to } = req.query;

      if (!from || !to) {
        return res.status(400).json({ success: false, error: 'Origin and destination are required' });
      }

      const [routes] = await pool.execute(
        `SELECT r.*, 
                t.type AS transport_type, 
                t.name AS transport_name,
                t.total_seats, 
                t.seat_layout, 
                t.amenities
        FROM routes r
        JOIN transports t ON r.transport_id = t.id
        WHERE r.origin = ? AND r.destination = ? AND r.active = 1`,
        [from, to]
      );

      for (const route of routes) {
        const [stops] = await pool.execute(
          'SELECT * FROM stops WHERE route_id = ? ORDER BY sequence_order',
          [route.id]
        );
        route.stops = stops;

        const layout = route.seat_layout ? JSON.parse(route.seat_layout) : null;
        route.seat_layout = layout;
        route.amenities = route.amenities ? JSON.parse(route.amenities) : null;

        const bookedSeats = await getBookedSeatDetails(route.transport_id, route.id);
        route.seat_arrangement = layout ? arrangeSeatsInLayout(layout, bookedSeats) : [];
      }

      res.json({ success: true, data: routes });
    } catch (error) {
      console.error('Error fetching routes:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch routes' });
    }
  },

  getRouteStops: async (req, res) => {
    try {
      const { id } = req.params;
      const [stops] = await pool.execute(
        'SELECT * FROM stops WHERE route_id = ? ORDER BY sequence_order',
        [id]
      );

      if (stops.length === 0) {
        return res.status(404).json({ success: false, error: 'No stops found for this route' });
      }

      res.json({ success: true, data: stops });
    } catch (error) {
      console.error('Error fetching stops:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch stops' });
    }
  },

  getAvailableSeats: async (req, res) => {
    try {
      const { routeId, transportId } = req.params;

      const [layoutResult] = await pool.execute(
        `SELECT t.seat_layout
        FROM routes r
        JOIN transports t ON r.transport_id = t.id
        WHERE r.id = ? AND t.id = ?`,
        [routeId, transportId]
      );

      if (layoutResult.length === 0) {
        return res.status(404).json({ success: false, error: 'Route or transport not found' });
      }

      const layout = layoutResult[0].seat_layout ? JSON.parse(layoutResult[0].seat_layout) : null;
      const bookedSeats = await getBookedSeatDetails(transportId, routeId);

      const seatArrangement = arrangeSeatsInLayout(layout, bookedSeats);

      res.json({ success: true, data: seatArrangement });
    } catch (error) {
      console.error('Error fetching available seats:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch available seats' });
    }
  },

  // New controller methods
  getTransportSeats: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get transport with seat layout
      const [transports] = await pool.execute(
        'SELECT * FROM transports WHERE id = ?',
        [id]
      );
      
      if (transports.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Transport not found' 
        });
      }

      const transport = transports[0];
      const layout = transport.seat_layout ? JSON.parse(transport.seat_layout) : null;
      const bookedSeats = await getBookedSeatDetails(id);

      res.json({ 
        success: true, 
        data: {
          transport_id: id,
          seat_layout: layout,
          seat_arrangement: layout ? arrangeSeatsInLayout(layout, bookedSeats) : []
        }
      });
    } catch (error) {
      console.error('Error fetching transport seats:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch transport seats' 
      });
    }
  },

  getRouteSeats: async (req, res) => {
    try {
      const { transportId, routeId } = req.params;
      
      // Verify the transport and route exist and match
      const [routes] = await pool.execute(
        `SELECT r.*, t.seat_layout 
        FROM routes r
        JOIN transports t ON r.transport_id = t.id
        WHERE r.id = ? AND t.id = ?`,
        [routeId, transportId]
      );
      
      if (routes.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Route or transport not found' 
        });
      }

      const route = routes[0];
      const layout = route.seat_layout ? JSON.parse(route.seat_layout) : null;
      const bookedSeats = await getBookedSeatDetails(transportId, routeId);

      res.json({ 
        success: true, 
        data: {
          transport_id: transportId,
          route_id: routeId,
          seat_layout: layout,
          seat_arrangement: layout ? arrangeSeatsInLayout(layout, bookedSeats) : []
        }
      });
    } catch (error) {
      console.error('Error fetching route seats:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch route seats' 
      });
    }
  }
}


// // Helper: Arrange seats in rows/columns and mark as booked
// const arrangeSeatsInLayout = (layout, bookedSeats = []) => {
//   const rows = layout?.rows || 0;
//   const columns = layout?.columns || 0;
//   const seatMatrix = [];

//   const bookedSet = new Set(bookedSeats.map(seat => seat.seat_number || seat)); // handles either string or object

//   for (let r = 1; r <= rows; r++) {
//     const row = [];
//     for (let c = 0; c < columns; c++) {
//       const seatLetter = String.fromCharCode(65 + c);
//       const seatNumber = `${r}${seatLetter}`;
//       row.push({
//         seat_number: seatNumber,
//         booked: bookedSet.has(seatNumber)
//       });
//     }
//     seatMatrix.push(row);
//   }

//   return seatMatrix;
// };

// module.exports = {
//   // Get all transports
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

//       const formatted = await Promise.all(transports.map(async (t) => {
//         const layout = t.seat_layout ? JSON.parse(t.seat_layout) : null;
//         const [bookedSeats] = await pool.execute(`
//           SELECT bs.seat_number FROM booked_seats bs
//           JOIN bookings b ON bs.booking_id = b.id
//           WHERE b.transport_id = ? AND b.status = 'pending'
//         `, [t.id]);

//         return {
//           ...t,
//           seat_layout: layout,
//           seat_arrangement: layout ? arrangeSeatsInLayout(layout, bookedSeats) : [],
//           amenities: t.amenities ? JSON.parse(t.amenities) : null
//         };
//       }));

//       res.json({ success: true, data: formatted });
//     } catch (error) {
//       console.error('Error fetching transports:', error);
//       res.status(500).json({ success: false, error: 'Failed to fetch transports' });
//     }
//   },

//   // Get single transport
//   getTransportById: async (req, res) => {
//     try {
//       const { id } = req.params;
//       const [result] = await pool.execute('SELECT * FROM transports WHERE id = ?', [id]);

//       if (result.length === 0) {
//         return res.status(404).json({ success: false, error: 'Transport not found' });
//       }

//       const transport = result[0];
//       const layout = transport.seat_layout ? JSON.parse(transport.seat_layout) : null;

//       const [bookedSeats] = await pool.execute(`
//         SELECT bs.seat_number FROM booked_seats bs
//         JOIN bookings b ON bs.booking_id = b.id
//         WHERE b.transport_id = ? AND b.status = 'pending'
//       `, [id]);

//       res.json({
//         success: true,
//         data: {
//           ...transport,
//           seat_layout: layout,
//           seat_arrangement: layout ? arrangeSeatsInLayout(layout, bookedSeats) : [],
//           amenities: transport.amenities ? JSON.parse(transport.amenities) : null
//         }
//       });
//     } catch (error) {
//       console.error('Error fetching transport:', error);
//       res.status(500).json({ success: false, error: 'Failed to fetch transport' });
//     }
//   },

//   // Get routes
//   getRoutes: async (req, res) => {
//     try {
//       const { from, to } = req.query;
//       if (!from || !to) {
//         return res.status(400).json({ success: false, error: 'Origin and destination are required' });
//       }

//       const [routes] = await pool.execute(`
//         SELECT r.*, t.name AS transport_name, t.total_seats, t.seat_layout, t.amenities
//         FROM routes r
//         JOIN transports t ON r.transport_id = t.id
//         WHERE r.origin = ? AND r.destination = ? AND r.active = 1
//       `, [from, to]);

//       for (const route of routes) {
//         const layout = route.seat_layout ? JSON.parse(route.seat_layout) : null;
//         const [stops] = await pool.execute('SELECT * FROM stops WHERE route_id = ? ORDER BY sequence_order', [route.id]);

//         const [bookedSeats] = await pool.execute(`
//           SELECT bs.seat_number FROM booked_seats bs
//           JOIN bookings b ON bs.booking_id = b.id
//           WHERE b.route_id = ? AND b.transport_id = ? AND b.status = 'pending'
//         `, [route.id, route.transport_id]);

//         route.stops = stops;
//         route.seat_layout = layout;
//         route.amenities = route.amenities ? JSON.parse(route.amenities) : null;
//         route.seat_arrangement = layout ? arrangeSeatsInLayout(layout, bookedSeats) : [];
//       }

//       res.json({ success: true, data: routes });
//     } catch (error) {
//       console.error('Error fetching routes:', error);
//       res.status(500).json({ success: false, error: 'Failed to fetch routes' });
//     }
//   },

//   // Get route stops
//   getRouteStops: async (req, res) => {
//     try {
//       const { id } = req.params;
//       const [stops] = await pool.execute(
//         'SELECT * FROM stops WHERE route_id = ? ORDER BY sequence_order',
//         [id]
//       );

//       if (stops.length === 0) {
//         return res.status(404).json({ success: false, error: 'No stops found for this route' });
//       }

//       res.json({ success: true, data: stops });
//     } catch (error) {
//       console.error('Error fetching stops:', error);
//       res.status(500).json({ success: false, error: 'Failed to fetch stops' });
//     }
//   },

//   // Get available seats
//   getAvailableSeats: async (req, res) => {
//     try {
//       const { routeId, transportId } = req.params;

//       const [layoutResult] = await pool.execute(`
//         SELECT t.seat_layout
//         FROM routes r
//         JOIN transports t ON r.transport_id = t.id
//         WHERE r.id = ? AND t.id = ?
//       `, [routeId, transportId]);

//       if (layoutResult.length === 0) {
//         return res.status(404).json({ success: false, error: 'Route or transport not found' });
//       }

//       const layout = layoutResult[0].seat_layout ? JSON.parse(layoutResult[0].seat_layout) : null;

//       const [bookedSeats] = await pool.execute(`
//         SELECT bs.seat_number FROM booked_seats bs
//         JOIN bookings b ON bs.booking_id = b.id
//         WHERE b.route_id = ? AND b.transport_id = ? AND b.status = 'pending'
//       `, [routeId, transportId]);

//       const arranged = layout ? arrangeSeatsInLayout(layout, bookedSeats) : [];

//       res.json({ success: true, data: arranged });
//     } catch (error) {
//       console.error('Error fetching available seats:', error);
//       res.status(500).json({ success: false, error: 'Failed to fetch available seats' });
//     }
//   }
// };






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