const { User , sequelize, Sequelize, Op } = require('../models');

module.exports = {
  getUserProfile: async (req, res) => {
    try {
      const { userId } = req.user;
      
      const user = await User.findByPk(userId, {
        attributes: [
          'id', 'uuid', 'email', 'phone', 'first_name', 'last_name',
          'language_pref', 'theme_pref', 'created_at'
        ]
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { userId } = req.user;
      const { firstName, lastName, phone } = req.body;
      
      const [updated] = await User.update(
        { first_name: firstName, last_name: lastName, phone },
        { where: { id: userId } }
      );
      
      if (updated === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updatePreferences: async (req, res) => {
    try {
      const { userId } = req.user;
      const { languagePref, themePref } = req.body;
      
      const [updated] = await User.update(
        { language_pref: languagePref, theme_pref: themePref },
        { where: { id: userId } }
      );
      
      if (updated === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ message: 'Preferences updated successfully' });
    } catch (error) {
      console.error('Error updating preferences:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  uploadProfilePicture: async (req, res) => {
    try {
      const { userId } = req.user;
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const profilePicture = `/uploads/${req.file.filename}`;
      const [updated] = await User.update(
        { profile_picture: profilePicture },
        { where: { id: userId } }
      );
      
      if (updated === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ 
        message: 'Profile picture uploaded successfully',
        profilePicture
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};



// const { execute } = require('../config/db');

// module.exports = {
//   getUserProfile: async (req, res) => {
//     try {
//       const { userId } = req.user;
      
//       const [user] = await execute(
//         `SELECT id, uuid, email, phone, first_name, last_name, 
//          language_pref, theme_pref, created_at 
//          FROM users WHERE id = ?`,
//         [userId]
//       );
      
//       if (!user) {
//         return res.status(404).json({ error: 'User not found' });
//       }
      
//       res.json(user);
//     } catch (error) {
//       console.error('Error fetching user profile:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   },

//   updateProfile: async (req, res) => {
//     try {
//       const { userId } = req.user;
//       const { firstName, lastName, phone } = req.body;
      
//       await execute(
//         'UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?',
//         [firstName, lastName, phone, userId]
//       );
      
//       res.json({ message: 'Profile updated successfully' });
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   },

//   updatePreferences: async (req, res) => {
//     try {
//       const { userId } = req.user;
//       const { languagePref, themePref } = req.body;
      
//       await execute(
//         'UPDATE users SET language_pref = ?, theme_pref = ? WHERE id = ?',
//         [languagePref, themePref, userId]
//       );
      
//       res.json({ message: 'Preferences updated successfully' });
//     } catch (error) {
//       console.error('Error updating preferences:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   },

//   uploadProfilePicture: async (req, res) => {
//     try {
//       const { userId } = req.user;
      
//       if (!req.file) {
//         return res.status(400).json({ error: 'No file uploaded' });
//       }
      
//       const profilePicture = `/uploads/${req.file.filename}`;
//       await execute(
//         'UPDATE users SET profile_picture = ? WHERE id = ?',
//         [profilePicture, userId]
//       );
      
//       res.json({ 
//         message: 'Profile picture uploaded successfully',
//         profilePicture
//       });
//     } catch (error) {
//       console.error('Error uploading profile picture:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// };