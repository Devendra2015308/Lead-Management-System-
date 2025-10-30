const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Register user
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        message: 'User with this email already exists' 
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Set cookie (for browsers that support it)
    const isProduction = process.env.NODE_ENV === 'production' || process.env.PORT;
    
    // Cookie configuration for cross-site compatibility
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction, // Only secure in production (requires HTTPS)
      sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/', // Ensure cookie is available for all paths
    };
    
    // For cross-site cookies in production, we need to be more explicit
    if (isProduction) {
      // Don't set domain - let browser handle it automatically
      // This allows the cookie to be sent to the exact domain
      // cookieOptions.domain = '.onrender.com';
      
      // Ensure sameSite is 'none' for cross-site requests
      cookieOptions.sameSite = 'none';
      
      // Ensure secure is true for sameSite: 'none'
      cookieOptions.secure = true;
    }
    
    console.log('Setting cookie with options:', cookieOptions);
    console.log('Token being set:', token.substring(0, 20) + '...');
    res.cookie('token', token, cookieOptions);
    
    // Log the Set-Cookie header that was sent
    console.log('Set-Cookie header:', res.getHeader('Set-Cookie'));

    // Return the token in the response for localStorage fallback
    res.json({
      message: 'Login successful',
      token: token, // Include token for localStorage
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout user
const logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.PORT;
  
  // Clear cookie with the same options used when setting it
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/'
  };
  
  // Ensure sameSite and secure are properly set for production
  if (isProduction) {
    cookieOptions.sameSite = 'none';
    cookieOptions.secure = true;
    // Don't set domain for logout
    // cookieOptions.domain = '.onrender.com';
  }
  
  console.log('Clearing cookie with options:', cookieOptions);
  res.clearCookie('token', cookieOptions);
  
  res.json({ message: 'Logged out successfully' });
};

// Get current user
const getCurrentUser = (req, res) => {
  res.json({
    user: req.user
  });
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser
};