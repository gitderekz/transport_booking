const { validateEmail, validatePhone } = require('./helpers');

const validateUserRegistration = (req, res, next) => {
  const { email, phone, password, firstName, lastName } = req.body;
  
  if (!email && !phone) {
    return res.status(400).json({ error: 'Email or phone is required' });
  }
  
  if (email && !validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  if (phone && !validatePhone(phone)) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }
  
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  if (!firstName || !lastName) {
    return res.status(400).json({ error: 'First name and last name are required' });
  }
  
  next();
};

const validateUserLogin = (req, res, next) => {
  const { email, phone, password } = req.body;
  
  if (!email && !phone) {
    return res.status(400).json({ error: 'Email or phone is required' });
  }
  
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  
  next();
};

const validateBooking = (req, res, next) => {
  const { routeId, transportId, pickupStopId, dropoffStopId, seats } = req.body;
  
  if (!routeId || !transportId || !pickupStopId || !dropoffStopId) {
    return res.status(400).json({ error: 'Missing required booking fields' });
  }
  
  if (!seats || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ error: 'At least one seat must be selected' });
  }
  
  for (const seat of seats) {
    if (!seat.seatNumber || !seat.passengerName) {
      return res.status(400).json({ error: 'Each seat must have a number and passenger name' });
    }
  }
  
  next();
};

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateBooking
};