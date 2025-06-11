const { Route, Transport, Stop, Booking, sequelize, Sequelize, Op } = require('../models');
// const db = require('../config/db');
module.exports = {
  getAllRoutes: async (req, res) => {
    try {
      const routes = await Route.findAll({
        where: { active: true },
        include: [{
          model: Transport,
          as: 'transport',
          // attributes: ['type', 'name']
        },
        {
          model: Booking,
          as: 'bookings',
          attributes: []
        }],
        order: [['origin', 'ASC'], ['destination', 'ASC']]
      });
      console.log({ success: true, data: routes })
      res.json({ success: true, data: routes });
    } catch (error) {
      console.error('Error fetching routes:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch routes' });
    }
  },

getPopularRoutes: async (req, res) => {
  try {
    const routes = await Route.findAll({
      subQuery: false,
      attributes: {
        include: [
          [Sequelize.fn('COUNT', Sequelize.col('bookings.id')), 'booking_count']
        ]
      },
      include: [
        {
          model: Transport,
          as: 'transport',
          attributes: ['type', 'name']
        },
        {
          model: Booking,
          as: 'bookings',
          attributes: []
        }
      ],
      where: { active: true },
      group: ['Route.id'],
      order: [[Sequelize.literal('booking_count'), 'DESC']],
      limit: 10
    });

    res.json({ success: true, data: routes });
  } catch (error) {
    console.error('Error fetching popular routes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch popular routes' });
  }
},

  searchRoutes: async (req, res) => {
    try {
      const { from, to, date, transportType } = req.query;
      
      const where = { active: true };
      const include = [{
        model: Transport,
        as: 'transport',
        attributes: ['type', 'name']
      }];
      
      if (from) {
        where.origin = { [Op.like]: `%${from}%` };
      }
      
      if (to) {
        where.destination = { [Op.like]: `%${to}%` };
      }
      
      if (transportType) {
        include[0].where = { type: transportType };
      }
      
      // Add date filtering logic if needed
      // This would depend on your schedule implementation
      
      const routes = await Route.findAll({
        where,
        include,
        order: [['base_price', 'ASC']]
      });
      
      res.json({ success: true, data: routes });
    } catch (error) {
      console.error('Error searching routes:', error);
      res.status(500).json({ success: false, error: 'Failed to search routes' });
    }
  },

  getRoutesByTransport: async (req, res) => {
    try {
      const { transportId } = req.params;
      
      const routes = await Route.findAll({
        where: { transport_id: transportId, active: true },
        include: [{
          model: Transport,
          as: 'transport',
          attributes: ['type', 'name']
        }],
        order: [['origin', 'ASC'], ['destination', 'ASC']]
      });
      
      res.json({ success: true, data: routes });
    } catch (error) {
      console.error('Error fetching routes by transport:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch routes' });
    }
  },

  getRouteById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const route = await Route.findByPk(id, {
        include: [{
          model: Transport,
          as: 'transport',
          attributes: ['type', 'name']
        }]
      });
      
      if (!route) {
        return res.status(404).json({ success: false, error: 'Route not found' });
      }
      
      res.json({ success: true, data: route });
    } catch (error) {
      console.error('Error fetching route:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch route' });
    }
  },

  getRouteStops: async (req, res) => {
    try {
      const { id } = req.params;
      
      const stops = await Stop.findAll({
        where: { route_id: id },
        order: [['sequence_order', 'ASC']]
      });
      
      res.json({ success: true, data: stops });
    } catch (error) {
      console.error('Error fetching route stops:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch stops' });
    }
  },

  createRoute: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { transport_id, origin, destination, base_price, duration_minutes } = req.body;
      
      // Validate input
      if (!transport_id || !origin || !destination || !base_price) {
        await t.rollback();
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields' 
        });
      }
      
      const route = await Route.create({
        transport_id,
        origin,
        destination,
        base_price,
        duration_minutes
      }, { transaction: t });
      
      // Get the newly created route with transport info
      const fullRoute = await Route.findByPk(route.id, {
        include: [{
          model: Transport,
          as: 'transport',
          attributes: ['type', 'name']
        }],
        transaction: t
      });
      
      await t.commit();
      res.status(201).json({ 
        success: true, 
        data: fullRoute 
      });
    } catch (error) {
      await t.rollback();
      console.error('Error creating route:', error);
      res.status(500).json({ success: false, error: 'Failed to create route' });
    }
  },

  updateRoute: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { transport_id, origin, destination, base_price, duration_minutes, active } = req.body;
      
      const [updated] = await Route.update({
        transport_id,
        origin,
        destination,
        base_price,
        duration_minutes,
        active
      }, {
        where: { id },
        transaction: t
      });
      
      if (updated === 0) {
        await t.rollback();
        return res.status(404).json({ success: false, error: 'Route not found' });
      }
      
      // Get the updated route
      const route = await Route.findByPk(id, {
        include: [{
          model: Transport,
          as: 'transport',
          attributes: ['type', 'name']
        }],
        transaction: t
      });
      
      await t.commit();
      res.json({ 
        success: true, 
        data: route 
      });
    } catch (error) {
      await t.rollback();
      console.error('Error updating route:', error);
      res.status(500).json({ success: false, error: 'Failed to update route' });
    }
  },

  deleteRoute: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      
      const [updated] = await Route.update(
        { active: false },
        { 
          where: { id },
          transaction: t
        }
      );
      
      if (updated === 0) {
        await t.rollback();
        return res.status(404).json({ success: false, error: 'Route not found' });
      }
      
      await t.commit();
      res.json({ 
        success: true, 
        message: 'Route deactivated successfully' 
      });
    } catch (error) {
      await t.rollback();
      console.error('Error deleting route:', error);
      res.status(500).json({ success: false, error: 'Failed to delete route' });
    }
  }
};



// const db = require('../config/db');

// // Get all routes
// exports.getAllRoutes = async (req, res) => {
//   try {
//     const [routes] = await db.query(`
//       SELECT r.*, t.type as transport_type, t.name as transport_name
//       FROM routes r
//       JOIN transports t ON r.transport_id = t.id
//       WHERE r.active = 1
//       ORDER BY r.origin, r.destination
//     `);

//     // Ensure routes is always an array
//     const routesArray = Array.isArray(routes) ? routes : [routes];

//     console.log('routes:', routesArray);

//     res.json({ success: true, data: routesArray });
//   } catch (error) {
//     console.error('Error fetching routes:', error);
//     res.status(500).json({ success: false, error: 'Failed to fetch routes' });
//   }
// };

// // Get popular routes
// exports.getPopularRoutes = async (req, res) => {
//   try {
//     const [routes] = await db.query(`
//       SELECT r.*, t.type as transport_type, t.name as transport_name,
//              COUNT(b.id) as booking_count
//       FROM routes r
//       JOIN transports t ON r.transport_id = t.id
//       LEFT JOIN bookings b ON r.id = b.route_id
//       WHERE r.active = 1
//       GROUP BY r.id
//       ORDER BY booking_count DESC
//       LIMIT 10
//     `);

//     // Ensure routes is always an array
//     const routesArray = Array.isArray(routes) ? routes : [routes];

//     console.log('routes:', routesArray);

//     res.json({ success: true, data: routesArray });
//   } catch (error) {
//     console.error('Error fetching popular routes:', error);
//     res.status(500).json({ success: false, error: 'Failed to fetch popular routes' });
//   }
// };


// // Search routes
// exports.searchRoutes = async (req, res) => {
//   try {
//     const { from, to, date, transportType } = req.query;
    
//     let query = `
//       SELECT r.*, t.type as transport_type, t.name as transport_name
//       FROM routes r
//       JOIN transports t ON r.transport_id = t.id
//       WHERE r.active = 1
//     `;
    
//     const params = [];
    
//     if (from) {
//       query += ' AND r.origin LIKE ?';
//       params.push(`%${from}%`);
//     }
    
//     if (to) {
//       query += ' AND r.destination LIKE ?';
//       params.push(`%${to}%`);
//     }
    
//     if (transportType) {
//       query += ' AND t.type = ?';
//       params.push(transportType);
//     }
    
//     if (date) {
//       // Add date filtering logic if needed
//       // This would depend on your schedule implementation
//     }
    
//     query += ' ORDER BY r.base_price ASC';
    
//     const [routes] = await db.query(query, params);
//     res.json({ success: true, data: routes });
//   } catch (error) {
//     console.error('Error searching routes:', error);
//     res.status(500).json({ success: false, error: 'Failed to search routes' });
//   }
// };

// // Get routes by transport ID
// exports.getRoutesByTransport = async (req, res) => {
//   try {
//     const { transportId } = req.params;
//     const [routes] = await db.query(`
//       SELECT r.*, t.type as transport_type, t.name as transport_name
//       FROM routes r
//       JOIN transports t ON r.transport_id = t.id
//       WHERE r.transport_id = ? AND r.active = 1
//       ORDER BY r.origin, r.destination
//     `, [transportId]);
    
//     res.json({ success: true, data: routes });
//   } catch (error) {
//     console.error('Error fetching routes by transport:', error);
//     res.status(500).json({ success: false, error: 'Failed to fetch routes' });
//   }
// };

// // Get route by ID
// exports.getRouteById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const [routes] = await db.query(`
//       SELECT r.*, t.type as transport_type, t.name as transport_name
//       FROM routes r
//       JOIN transports t ON r.transport_id = t.id
//       WHERE r.id = ?
//     `, [id]);
    
//     if (routes.length === 0) {
//       return res.status(404).json({ success: false, error: 'Route not found' });
//     }
    
//     res.json({ success: true, data: routes[0] });
//   } catch (error) {
//     console.error('Error fetching route:', error);
//     res.status(500).json({ success: false, error: 'Failed to fetch route' });
//   }
// };

// // Get stops for a route
// exports.getRouteStops = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const [stops] = await db.query(`
//       SELECT s.*
//       FROM stops s
//       WHERE s.route_id = ?
//       ORDER BY s.sequence_order
//     `, [id]);
    
//     res.json({ success: true, data: stops });
//   } catch (error) {
//     console.error('Error fetching route stops:', error);
//     res.status(500).json({ success: false, error: 'Failed to fetch stops' });
//   }
// };

// // Create a new route
// exports.createRoute = async (req, res) => {
//   try {
//     const { transport_id, origin, destination, base_price, duration_minutes } = req.body;
    
//     // Validate input
//     if (!transport_id || !origin || !destination || !base_price) {
//       return res.status(400).json({ 
//         success: false, 
//         error: 'Missing required fields' 
//       });
//     }
    
//     const [result] = await db.query(`
//       INSERT INTO routes 
//       (transport_id, origin, destination, base_price, duration_minutes)
//       VALUES (?, ?, ?, ?, ?)
//     `, [transport_id, origin, destination, base_price, duration_minutes]);
    
//     // Get the newly created route
//     const [routes] = await db.query(`
//       SELECT r.*, t.type as transport_type, t.name as transport_name
//       FROM routes r
//       JOIN transports t ON r.transport_id = t.id
//       WHERE r.id = ?
//     `, [result.insertId]);
    
//     res.status(201).json({ 
//       success: true, 
//       data: routes[0] 
//     });
//   } catch (error) {
//     console.error('Error creating route:', error);
//     res.status(500).json({ success: false, error: 'Failed to create route' });
//   }
// };

// // Update a route
// exports.updateRoute = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { transport_id, origin, destination, base_price, duration_minutes, active } = req.body;
    
//     await db.query(`
//       UPDATE routes SET
//         transport_id = ?,
//         origin = ?,
//         destination = ?,
//         base_price = ?,
//         duration_minutes = ?,
//         active = ?
//       WHERE id = ?
//     `, [transport_id, origin, destination, base_price, duration_minutes, active, id]);
    
//     // Get the updated route
//     const [routes] = await db.query(`
//       SELECT r.*, t.type as transport_type, t.name as transport_name
//       FROM routes r
//       JOIN transports t ON r.transport_id = t.id
//       WHERE r.id = ?
//     `, [id]);
    
//     res.json({ 
//       success: true, 
//       data: routes[0] 
//     });
//   } catch (error) {
//     console.error('Error updating route:', error);
//     res.status(500).json({ success: false, error: 'Failed to update route' });
//   }
// };

// // Delete a route (soft delete by setting active to 0)
// exports.deleteRoute = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     await db.query(`
//       UPDATE routes SET active = 0 WHERE id = ?
//     `, [id]);
    
//     res.json({ 
//       success: true, 
//       message: 'Route deactivated successfully' 
//     });
//   } catch (error) {
//     console.error('Error deleting route:', error);
//     res.status(500).json({ success: false, error: 'Failed to delete route' });
//   }
// };