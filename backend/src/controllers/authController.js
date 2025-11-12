import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/User.js';

// Admin Authentication
export const adminLogin = async (req, res) => {
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
};

// User Authentication
export const userLogin = async (req, res) => {
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
      { expiresIn: '30d' }
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
};

export const userRegister = async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ 
        success: false,
        message: 'Email, password, and full name are required' 
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
      phone
    });

    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
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
};

export const verifyToken = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const admin = await Admin.findById(req.user.id).select('-password');
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
      const user = await User.findById(req.user.id).select('-password');
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
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};