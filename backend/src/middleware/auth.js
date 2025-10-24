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
        message: 'Token is not valid'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

// Admin authentication - FIXED: Use Admin model instead of User model
const authenticateAdmin = async (req, res, next) => {
  try {
    console.log('🔐 Admin middleware - Checking authorization header');
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('🔐 No token provided');
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    console.log('🔐 Token found, verifying...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔐 Decoded token:', decoded);
    
    // FIX: Look for admin in Admin collection, not User collection
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      console.log('🔐 Admin not found in database for ID:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'Admin not found'
      });
    }

    console.log('🔐 Admin authenticated:', admin.username);
    req.user = admin; // You can use req.user or req.admin
    req.admin = admin; // Add both for clarity
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    
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

export { auth, authenticateAdmin };