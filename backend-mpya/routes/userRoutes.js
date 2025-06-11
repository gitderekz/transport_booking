const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { handleUpload } = require('../middleware/upload');

router.use(authenticate);

router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateProfile);
router.put('/preferences', userController.updatePreferences);
router.post('/profile/picture', 
  handleUpload('profilePicture'), 
  userController.uploadProfilePicture);

module.exports = router;