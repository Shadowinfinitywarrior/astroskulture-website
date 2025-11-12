import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

const router = express.Router();

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        addresses: user.addresses,
        role: user.role
      }
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isValidPassword = await admin.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        role: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
        message: 'Server error'
    });
  }
});

// Verify security questions for password reset
router.post('/forgot-password/verify', async (req, res) => {
  try {
    const { email, dateOfBirth, securityAnswer } = req.body;

    if (!email || !dateOfBirth || !securityAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Email, date of birth, and security answer are required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has security question set up
    if (!user.dateOfBirth || !user.securityAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Security questions not set up for this account'
      });
    }

    // Verify date of birth
    const userDOB = new Date(user.dateOfBirth).toISOString().split('T')[0];
    const providedDOB = new Date(dateOfBirth).toISOString().split('T')[0];
    
    if (userDOB !== providedDOB) {
      return res.status(401).json({
        success: false,
        message: 'Date of birth does not match'
      });
    }

    // Verify security answer (case-insensitive)
    const isValidAnswer = user.securityAnswer.toLowerCase().trim() === securityAnswer.toLowerCase().trim();
    
    if (!isValidAnswer) {
      return res.status(401).json({
        success: false,
        message: 'Security answer does not match'
      });
    }

    // Generate a temporary token for password reset
    const resetToken = jwt.sign(
      { id: user._id, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      resetToken,
      message: 'Security questions verified successfully'
    });
  } catch (error) {
    console.error('Forgot password verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Reset password
router.post('/forgot-password/reset', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Verify reset token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    
    if (decoded.purpose !== 'password-reset') {
      return res.status(401).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get security question for user
router.post('/forgot-password/question', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email }).select('securityQuestion');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.securityQuestion) {
      return res.status(400).json({
        success: false,
        message: 'Security question not set up for this account'
      });
    }

    res.json({
      success: true,
      securityQuestion: user.securityQuestion
    });
  } catch (error) {
    console.error('Get security question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// User registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, phone, dateOfBirth, securityQuestion, securityAnswer } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and full name are required'
      });
    }

    if (!dateOfBirth || !securityQuestion || !securityAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Date of birth, security question, and security answer are required'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = new User({
      email,
      password,
      fullName,
      phone,
      dateOfBirth,
      securityQuestion,
      securityAnswer
    });

    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        addresses: user.addresses,
        role: user.role
      }
    });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get current user profile (primary endpoint)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded.id).select('-password');
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }
      return res.json({
        success: true,
        user: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          fullName: admin.fullName,
          role: admin.role
        }
      });
    } else {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      return res.json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          addresses: user.addresses,
          role: user.role
        }
      });
    }
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Alias for /me endpoint for compatibility
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded.id).select('-password');
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }
      return res.json({
        success: true,
        user: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          fullName: admin.fullName,
          role: admin.role
        }
      });
    } else {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      return res.json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          addresses: user.addresses,
          role: user.role
        }
      });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

export default router;