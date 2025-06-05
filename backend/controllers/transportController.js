const { pool } = require('../config/db');

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
      console.log('Transport: ',transports);
      res.json({ success: true, data: transports });

    } catch (error) {
      console.error('Error fetching transports:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getTransportById: async (req, res) => {
    try {
      const { id } = req.params;
      const [transports] = await pool.execute(
        'SELECT * FROM transports WHERE id = ?',
        [id]
      );
      
      if (transports.length === 0) {
        return res.status(404).json({ error: 'Transport not found' });
      }
      
      res.json(transports[0]);
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
      
      // Basic route search - you'd enhance this with date filtering
      const [routes] = await pool.execute(
        `SELECT r.*, t.type, t.name as transport_name, t.total_seats, t.seat_layout
         FROM routes r
         JOIN transports t ON r.transport_id = t.id
         WHERE r.origin = ? AND r.destination = ? AND r.active = TRUE`,
        [from, to]
      );
      
      // Get stops for each route
      for (const route of routes) {
        const [stops] = await pool.execute(
          'SELECT * FROM stops WHERE route_id = ? ORDER BY sequence_order',
          [route.id]
        );
        route.stops = stops;
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
      const [stops] = await pool.execute(
        'SELECT * FROM stops WHERE route_id = ? ORDER BY sequence_order',
        [id]
      );
      
      if (stops.length === 0) {
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
      const [route] = await pool.execute(
        'SELECT * FROM routes WHERE id = ? AND transport_id = ?',
        [routeId, transportId]
      );
      
      if (route.length === 0) {
        return res.status(404).json({ error: 'Route not found' });
      }
      
      // Get available seats using the view we created
      const [seats] = await pool.execute(
        'SELECT seat_number FROM available_seats WHERE route_id = ? AND transport_id = ?',
        [routeId, transportId]
      );
      
      res.json(seats.map(s => s.seat_number));
    } catch (error) {
      console.error('Error fetching available seats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};