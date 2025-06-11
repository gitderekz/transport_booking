const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/popular', routeController.getPopularRoutes);
router.get('/search', routeController.searchRoutes);
router.get('/transport/:transportId', routeController.getRoutesByTransport);
router.get('/', routeController.getAllRoutes);
router.get('/:id', routeController.getRouteById);
router.get('/:id/stops', routeController.getRouteStops);

// Protected routes (require authentication)
router.use(authenticate);

// Admin-only routes
router.use(authorize('admin'));
router.post('/', routeController.createRoute);
router.put('/:id', routeController.updateRoute);
router.delete('/:id', routeController.deleteRoute);

module.exports = router;