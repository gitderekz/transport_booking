const { Stop, Route , sequelize, Sequelize, Op } = require('../models');

module.exports = {
  getAllStops: async (req, res) => {
    try {
      const stops = await Stop.findAll({
        include: [{
          model: Route,
          as: 'route',
          attributes: ['origin', 'destination']
        }],
        order: [['station_name', 'ASC']]
      });
      
      res.json({ success: true, data: stops });
    } catch (error) {
      console.error('Error fetching stops:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch stops' });
    }
  },

  getStopsByRoute: async (req, res) => {
    try {
      const { routeId } = req.params;
      
      const stops = await Stop.findAll({
        where: { route_id: routeId },
        order: [['sequence_order', 'ASC']]
      });
      
      res.json({ success: true, data: stops });
    } catch (error) {
      console.error('Error fetching route stops:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch route stops' });
    }
  },

  createStop: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { route_id, station_name, arrival_time, departure_time, sequence_order, additional_fee } = req.body;
      
      const stop = await Stop.create({
        route_id,
        station_name,
        arrival_time,
        departure_time,
        sequence_order,
        additional_fee
      }, { transaction: t });
      
      await t.commit();
      res.status(201).json({ 
        success: true, 
        data: stop 
      });
    } catch (error) {
      await t.rollback();
      console.error('Error creating stop:', error);
      res.status(500).json({ success: false, error: 'Failed to create stop' });
    }
  },

  updateStop: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { station_name, arrival_time, departure_time, sequence_order, additional_fee } = req.body;
      
      const [updated] = await Stop.update({
        station_name,
        arrival_time,
        departure_time,
        sequence_order,
        additional_fee
      }, {
        where: { id },
        transaction: t
      });
      
      if (updated === 0) {
        await t.rollback();
        return res.status(404).json({ success: false, error: 'Stop not found' });
      }
      
      const stop = await Stop.findByPk(id, { transaction: t });
      
      await t.commit();
      res.json({ 
        success: true, 
        message: 'Stop updated successfully',
        data: stop
      });
    } catch (error) {
      await t.rollback();
      console.error('Error updating stop:', error);
      res.status(500).json({ success: false, error: 'Failed to update stop' });
    }
  },

  deleteStop: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      
      const deleted = await Stop.destroy({
        where: { id },
        transaction: t
      });
      
      if (deleted === 0) {
        await t.rollback();
        return res.status(404).json({ success: false, error: 'Stop not found' });
      }
      
      await t.commit();
      res.json({ 
        success: true, 
        message: 'Stop deleted successfully' 
      });
    } catch (error) {
      await t.rollback();
      console.error('Error deleting stop:', error);
      res.status(500).json({ success: false, error: 'Failed to delete stop' });
    }
  }
};



// // backend/controllers/stopController.js
// const db = require('../config/db');

// // Get all stops
// exports.getAllStops = async (req, res) => {
//   try {
//     const [stops] = await req.db.query(`
//       SELECT s.*, r.origin, r.destination 
//       FROM stops s
//       JOIN routes r ON s.route_id = r.id
//       ORDER BY s.station_name
//     `);
    
//     res.json({ success: true, data: stops });
//   } catch (error) {
//     console.error('Error fetching stops:', error);
//     res.status(500).json({ success: false, error: 'Failed to fetch stops' });
//   }
// };

// // Get stops for a specific route
// exports.getStopsByRoute = async (req, res) => {
//   try {
//     const { routeId } = req.params;
//     const [stops] = await req.db.query(`
//       SELECT * FROM stops 
//       WHERE route_id = ?
//       ORDER BY sequence_order
//     `, [routeId]);
    
//     res.json({ success: true, data: stops });
//   } catch (error) {
//     console.error('Error fetching route stops:', error);
//     res.status(500).json({ success: false, error: 'Failed to fetch route stops' });
//   }
// };

// // Create a new stop
// exports.createStop = async (req, res) => {
//   try {
//     const { route_id, station_name, arrival_time, departure_time, sequence_order, additional_fee } = req.body;
    
//     const [result] = await req.db.query(`
//       INSERT INTO stops 
//       (route_id, station_name, arrival_time, departure_time, sequence_order, additional_fee)
//       VALUES (?, ?, ?, ?, ?, ?)
//     `, [route_id, station_name, arrival_time, departure_time, sequence_order, additional_fee]);
    
//     res.status(201).json({ 
//       success: true, 
//       data: { id: result.insertId, ...req.body }
//     });
//   } catch (error) {
//     console.error('Error creating stop:', error);
//     res.status(500).json({ success: false, error: 'Failed to create stop' });
//   }
// };

// // Update a stop
// exports.updateStop = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { station_name, arrival_time, departure_time, sequence_order, additional_fee } = req.body;
    
//     await req.db.query(`
//       UPDATE stops SET
//         station_name = ?,
//         arrival_time = ?,
//         departure_time = ?,
//         sequence_order = ?,
//         additional_fee = ?
//       WHERE id = ?
//     `, [station_name, arrival_time, departure_time, sequence_order, additional_fee, id]);
    
//     res.json({ success: true, message: 'Stop updated successfully' });
//   } catch (error) {
//     console.error('Error updating stop:', error);
//     res.status(500).json({ success: false, error: 'Failed to update stop' });
//   }
// };

// // Delete a stop
// exports.deleteStop = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await req.db.query('DELETE FROM stops WHERE id = ?', [id]);
//     res.json({ success: true, message: 'Stop deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting stop:', error);
//     res.status(500).json({ success: false, error: 'Failed to delete stop' });
//   }
// };