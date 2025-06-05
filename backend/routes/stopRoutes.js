// backend/routes/stopRoutes.js
const express = require('express');
const router = express.Router();
const stopController = require('../controllers/stopController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', stopController.getAllStops);
router.get('/route/:routeId', stopController.getStopsByRoute);

// Protected routes (require authentication)
router.use(authenticate);

// Admin-only routes
router.use(authorize('admin'));
router.post('/', stopController.createStop);
router.put('/:id', stopController.updateStop);
router.delete('/:id', stopController.deleteStop);

module.exports = router;