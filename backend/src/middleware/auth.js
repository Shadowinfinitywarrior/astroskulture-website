import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

// Regular user authentication
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid - user not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Admin authentication
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Look for admin in Admin collection
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found or unauthorized'
      });
    }

    req.user = admin;
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    res.status(401).json({
      success: false,
      message: 'Admin authentication failed'
    });
  }
};

// Optional: Combined middleware that works for both users and admins
const authenticateOptional = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // No token, but continue (for public routes that optionally need user info)
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try to find user first
    let user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      // If not a regular user, try admin
      user = await Admin.findById(decoded.id).select('-password');
      if (user) {
        req.admin = user;
      }
    }
    
    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // For optional auth, we don't block the request on token errors
    console.error('Optional auth middleware error:', error.message);
    next();
  }
};

export { auth, authenticateAdmin, authenticateOptional };