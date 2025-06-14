const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transportController');

router.get('/', transportController.getAllTransports);
router.get('/:id', transportController.getTransportById);
router.get('/:id/seats', transportController.getTransportSeats); // New endpoint
router.get('/:transportId/routes/:routeId/seats', transportController.getRouteSeats); // New endpoint
router.get('/routes/search', transportController.getRoutes);
router.get('/routes/:id/stops', transportController.getRouteStops);
router.get('/:transportId/routes/:routeId/seats/available', 
  transportController.getAvailableSeats);

module.exports = router;