module.exports = (roles = []) => {
  return (req, res, next) => {
    // In a real implementation, you would check the user's role
    // For this example, we'll just check if the user is authenticated
    if (!req.user) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // If roles are specified, check if user has one of them
    if (roles.length > 0) {
      // This would come from the database in a real app
      const userRole = 'user'; // Default role
      
      if (!roles.includes(userRole)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
    }
    
    next();
  };
};