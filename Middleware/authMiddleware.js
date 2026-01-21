// Middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../Models/User.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route. Please login.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'User not found'
        });
      }

      if (!req.user.isActive) {
        return res.status(403).json({
          status: 'error',
          message: 'Your account has been deactivated'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized, token failed'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error in authentication'
    });
  }
};
