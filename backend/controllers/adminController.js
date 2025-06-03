const { execute } = require('../config/db');

module.exports = {
  getAllUsers: async (req, res) => {
    try {
      const users = await execute(
        'SELECT id, uuid, email, phone, first_name, last_name, is_verified, created_at FROM users'
      );
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getTransportStats: async (req, res) => {
    try {
      const stats = await execute(`
        SELECT 
          t.type,
          COUNT(r.id) as route_count,
          COUNT(b.id) as booking_count,
          SUM(b.total_price) as total_revenue
        FROM transports t
        LEFT JOIN routes r ON t.id = r.transport_id
        LEFT JOIN bookings b ON r.id = b.route_id
        GROUP BY t.type
      `);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching transport stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getBookingStats: async (req, res) => {
    try {
      const stats = await execute(`
        SELECT 
          status,
          payment_status,
          COUNT(id) as count,
          SUM(total_price) as total_amount
        FROM bookings
        GROUP BY status, payment_status
      `);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateTransport: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, total_seats, amenities } = req.body;
      
      await execute(
        'UPDATE transports SET name = ?, total_seats = ?, amenities = ? WHERE id = ?',
        [name, total_seats, JSON.stringify(amenities), id]
      );
      
      res.json({ message: 'Transport updated successfully' });
    } catch (error) {
      console.error('Error updating transport:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};