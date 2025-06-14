const db = require('../config/db');

exports.getAllRoutes = async (req, res) => {
  try {
    const { page = 1, limit = 10, origin, destination, transport_type } = req.query;

    const offset = (page - 1) * limit;
    const filters = [];
    const params = [];

    if (origin) {
      filters.push("r.origin = ?");
      params.push(origin);
    }

    if (destination) {
      filters.push("r.destination = ?");
      params.push(destination);
    }

    if (transport_type) {
      filters.push("t.type = ?");
      params.push(transport_type);
    }

    const whereClause = filters.length > 0 ? `AND ${filters.join(" AND ")}` : '';

    // ✅ Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM routes r
      JOIN transports t ON r.transport_id = t.id
      WHERE r.active = 1 ${whereClause}
    `;
    const totalResult = await db.query(countQuery, params);
    const total = totalResult[0]?.total || 0;

    // ✅ Get route data with seat layout and amenities
    const dataQuery = `
      SELECT r.*, 
             t.type AS transport_type, 
             t.name AS transport_name,
             t.seat_layout,
             t.amenities
      FROM routes r
      JOIN transports t ON r.transport_id = t.id
      WHERE r.active = 1 ${whereClause}
      ORDER BY r.origin, r.destination
      LIMIT ? OFFSET ?
    `;
    const dataParams = [...params, parseInt(limit), parseInt(offset)];
    const routes = await db.query(dataQuery, dataParams);

    // ✅ Format and parse data
    const formattedRoutes = routes.map(route => {
      const seatLayout = safeJsonParse(route.seat_layout);
      const amenities = safeJsonParse(route.amenities);

      return {
        ...route,
        seat_layout: seatLayout
          ? {
              ...seatLayout,
              seats: groupSeatsByRow(seatLayout)
            }
          : null,
        amenities
      };
    });

    // ✅ Final response with metadata
    res.json({
      success: true,
      data: formattedRoutes,
      meta: {
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch routes' });
  }
};

// ✅ Safely parse JSON fields
function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

// ✅ Group flat seat list into rows
function groupSeatsByRow(seatLayout) {
  if (!seatLayout || !seatLayout.rows || !seatLayout.columns || !Array.isArray(seatLayout.seats)) {
    return [];
  }

  const grouped = [];

  for (let i = 0; i < seatLayout.rows; i++) {
    const start = i * seatLayout.columns;
    const end = start + seatLayout.columns;
    grouped.push(seatLayout.seats.slice(start, end));
  }

  return grouped;
}


exports.getPopularRoutes = async (req, res) => {
  try {
    const query = `
      SELECT 
        r.id,
        r.origin,
        r.destination,
        r.base_price,
        r.duration_minutes,
        r.active,
        r.created_at,
        r.updated_at,
        r.transport_id,
        t.type AS transport_type,
        t.name AS transport_name,
        COUNT(b.id) AS booking_count
      FROM routes r
      JOIN transports t ON r.transport_id = t.id
      INNER JOIN bookings b ON r.id = b.route_id  -- ✅ Ensures at least one booking
      WHERE r.active = 1
      GROUP BY r.id, r.origin, r.destination, r.base_price, r.duration_minutes, r.active, r.created_at, r.updated_at, r.transport_id, t.type, t.name
      ORDER BY booking_count DESC
      LIMIT 10
    `;

    const popularRoutes = await db.query(query);

    res.json({
      success: true,
      data: popularRoutes
    });
  } catch (error) {
    console.error('Error fetching popular routes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch popular routes' });
  }
};

// 🔍 searchRoutes
exports.searchRoutes = async (req, res) => {
  try {
    const { from, to, date, transportType } = req.query;

    let query = `
      SELECT r.id, r.origin, r.destination, r.base_price, r.duration_minutes, r.active, r.created_at, r.updated_at,
             t.id as transport_id, t.type as transport_type, t.name as transport_name, t.seat_layout, t.amenities
      FROM routes r
      JOIN transports t ON r.transport_id = t.id
      WHERE r.active = 1
    `;

    const params = [];

    if (from) {
      query += ' AND r.origin LIKE ?';
      params.push(`%${from}%`);
    }

    if (to) {
      query += ' AND r.destination LIKE ?';
      params.push(`%${to}%`);
    }

    if (transportType) {
      query += ' AND t.type = ?';
      params.push(transportType);
    }

    query += ' ORDER BY r.base_price ASC';

    const [routes] = await db.query(query, params);

    const formattedRoutes = routes.map(route => ({
      ...route,
      seat_layout: JSON.parse(route.seat_layout || '{}'),
      amenities: JSON.parse(route.amenities || '{}'),
    }));

    res.json({ success: true, data: formattedRoutes });
  } catch (error) {
    console.error('Error searching routes:', error);
    res.status(500).json({ success: false, error: 'Failed to search routes' });
  }
};


// 🚌 getRoutesByTransport
exports.getRoutesByTransport = async (req, res) => {
  try {
    const { transportId } = req.params;

    const [routes] = await db.query(`
      SELECT r.*, t.type as transport_type, t.name as transport_name
      FROM routes r
      JOIN transports t ON r.transport_id = t.id
      WHERE r.transport_id = ? AND r.active = 1
      ORDER BY r.origin, r.destination
    `, [transportId]);

    res.json({ success: true, data: routes });
  } catch (error) {
    console.error('Error fetching routes by transport:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch routes' });
  }
};


// 🔎 getRouteById
exports.getRouteById = async (req, res) => {
  try {
    const { id } = req.params;

    const [routes] = await db.query(`
      SELECT r.*, t.type as transport_type, t.name as transport_name, t.seat_layout, t.amenities
      FROM routes r
      JOIN transports t ON r.transport_id = t.id
      WHERE r.id = ?
    `, [id]);

    if (routes.length === 0) {
      return res.status(404).json({ success: false, error: 'Route not found' });
    }

    const route = routes[0];

    route.seat_layout = JSON.parse(route.seat_layout || '{}');
    route.amenities = JSON.parse(route.amenities || '{}');

    res.json({ success: true, data: route });
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch route' });
  }
};



// 🛑 getRouteStops
exports.getRouteStops = async (req, res) => {
  try {
    const { id } = req.params;

    const [stops] = await db.query(`
      SELECT s.*
      FROM stops s
      WHERE s.route_id = ?
      ORDER BY s.sequence_order
    `, [id]);

    res.json({ success: true, data: stops });
  } catch (error) {
    console.error('Error fetching route stops:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stops' });
  }
};



// 🆕 createRoute
exports.createRoute = async (req, res) => {
  try {
    const { transport_id, origin, destination, base_price, duration_minutes } = req.body;

    if (!transport_id || !origin || !destination || !base_price || !duration_minutes) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const [result] = await db.query(`
      INSERT INTO routes 
      (transport_id, origin, destination, base_price, duration_minutes)
      VALUES (?, ?, ?, ?, ?)
    `, [transport_id, origin, destination, base_price, duration_minutes]);

    const [routes] = await db.query(`
      SELECT r.*, t.type as transport_type, t.name as transport_name
      FROM routes r
      JOIN transports t ON r.transport_id = t.id
      WHERE r.id = ?
    `, [result.insertId]);

    res.status(201).json({ success: true, data: routes[0] });
  } catch (error) {
    console.error('Error creating route:', error);
    res.status(500).json({ success: false, error: 'Failed to create route' });
  }
};



// ✏️ updateRoute
exports.updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { transport_id, origin, destination, base_price, duration_minutes, active } = req.body;

    await db.query(`
      UPDATE routes SET
        transport_id = ?,
        origin = ?,
        destination = ?,
        base_price = ?,
        duration_minutes = ?,
        active = ?
      WHERE id = ?
    `, [transport_id, origin, destination, base_price, duration_minutes, active, id]);

    const [routes] = await db.query(`
      SELECT r.*, t.type as transport_type, t.name as transport_name
      FROM routes r
      JOIN transports t ON r.transport_id = t.id
      WHERE r.id = ?
    `, [id]);

    res.json({ success: true, data: routes[0] });
  } catch (error) {
    console.error('Error updating route:', error);
    res.status(500).json({ success: false, error: 'Failed to update route' });
  }
};



// ❌ deleteRoute (soft delete)
exports.deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(`UPDATE routes SET active = 0 WHERE id = ?`, [id]);

    res.json({ success: true, message: 'Route deactivated successfully' });
  } catch (error) {
    console.error('Error deleting route:', error);
    res.status(500).json({ success: false, error: 'Failed to delete route' });
  }
};
















// exports.getAllRoutes = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, origin, destination, transport_type } = req.query;

//     const offset = (page - 1) * limit;

//     const filters = [];
//     const params = [];

//     if (origin) {
//       filters.push("r.origin = ?");
//       params.push(origin);
//     }

//     if (destination) {
//       filters.push("r.destination = ?");
//       params.push(destination);
//     }

//     if (transport_type) {
//       filters.push("t.type = ?");
//       params.push(transport_type);
//     }

//     let whereClause = filters.length > 0 ? `AND ${filters.join(" AND ")}` : '';

//     const query = `
//       SELECT r.*, 
//              t.type as transport_type, 
//              t.name as transport_name,
//              t.seat_layout,
//              t.amenities
//       FROM routes r
//       JOIN transports t ON r.transport_id = t.id
//       WHERE r.active = 1 ${whereClause}
//       ORDER BY r.origin, r.destination
//       LIMIT ? OFFSET ?
//     `;

//     params.push(parseInt(limit), parseInt(offset));

//     const routes = await db.query(query, params);

//     res.json({ success: true, data: routes });
//   } catch (error) {
//     console.error('Error fetching routes:', error);
//     res.status(500).json({ success: false, error: 'Failed to fetch routes' });
//   }
// };


// // Get all routes
// exports.getAllRoutes = async (req, res) => {
//   try {
//     const routes = await db.query(`
//       SELECT r.*, t.type as transport_type, t.name as transport_name
//       FROM routes r
//       JOIN transports t ON r.transport_id = t.id
//       WHERE r.active = 1
//       ORDER BY r.origin, r.destination
//     `);

//     // Ensure routes is always an array
//     const routesArray = Array.isArray(routes) ? routes : [routes];

//     res.json({ success: true, data: routesArray });
//   } catch (error) {
//     console.error('Error fetching routes:', error);
//     res.status(500).json({ success: false, error: 'Failed to fetch routes' });
//   }
// };

// Get popular routes


// exports.getPopularRoutes = async (req, res) => {
//   try {
//     const routes = await db.query(`
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


// Search routes

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