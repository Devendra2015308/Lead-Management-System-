const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware - Cookies:', req.cookies);
    console.log('Auth middleware - Origin:', req.headers.origin);
    console.log('Auth middleware - User-Agent:', req.headers['user-agent']);
    console.log('Auth middleware - Authorization header:', req.headers.authorization);
    
    // Try to get token from cookies first
    let token = req.cookies.token;
    
    // If no cookie token, try Authorization header as fallback
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
        console.log('Auth middleware - Using token from Authorization header');
      }
    }

    if (!token) {
      console.log('Auth middleware - No token found in cookies or Authorization header');
      console.log('Auth middleware - All cookies:', Object.keys(req.cookies));
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid token. User not found.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      message: 'Invalid token.' 
    });
  }
};

module.exports = auth;