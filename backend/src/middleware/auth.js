import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

// Regular user authentication
const auth = async (req, res, next) => {
  let decoded;
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Auth token verification error:', error.message);
    
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
    
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }

  // Token is verified successfully. Fetch user from DB.
  try {
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid - user not found'
      });
    }

    req.user = user;
    next();
  } catch (dbError) {
    console.error('Auth database query error (Tor timeout):', dbError.message);
    return res.status(500).json({
      success: false,
      message: 'Database query timeout. Please try again in a few moments.'
    });
  }
};

// Admin authentication
const authenticateAdmin = async (req, res, next) => {
  let decoded;
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Admin auth token verification error:', error.message);
    
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
    
    return res.status(401).json({
      success: false,
      message: 'Admin authentication failed'
    });
  }

  // Token is verified successfully. Fetch admin from DB.
  try {
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
  } catch (dbError) {
    console.error('Admin auth database query error (Tor timeout):', dbError.message);
    return res.status(500).json({
      success: false,
      message: 'Database query timeout. Please try again in a few moments.'
    });
  }
};

// Optional: Combined middleware that works for both users and admins
const authenticateOptional = async (req, res, next) => {
  let decoded;
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next();
    }

    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Optional auth token verification error:', error.message);
    return next();
  }

  // Token is verified successfully. Fetch user/admin from DB.
  try {
    let user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      user = await Admin.findById(decoded.id).select('-password');
      if (user) {
        req.admin = user;
      }
    }
    
    if (user) {
      req.user = user;
    }
    
    next();
  } catch (dbError) {
    console.error('Optional auth database query error (Tor timeout):', dbError.message);
    next();
  }
};

export { auth, authenticateAdmin, authenticateOptional };