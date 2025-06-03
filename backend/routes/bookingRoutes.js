const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/', bookingController.createBooking);
router.get('/', bookingController.getUserBookings);
router.get('/:id', bookingController.getBookingDetails);
router.put('/:id/cancel', bookingController.cancelBooking);

module.exports = router;