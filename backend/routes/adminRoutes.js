const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { roles } = require('../middleware/roles');

// Admin routes - require admin role
router.use(authenticate);
router.use(roles(['admin']));

router.get('/users', adminController.getAllUsers);
router.get('/stats/transports', adminController.getTransportStats);
router.get('/stats/bookings', adminController.getBookingStats);
router.put('/transports/:id', adminController.updateTransport);

module.exports = router;