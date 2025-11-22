import express from 'express';
import Settings from '../models/Settings.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const adminAuthMiddleware = async (req, res, next) => {
  const adminAuth = req.headers.authorization?.startsWith('Bearer ');
  if (!adminAuth) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
};

router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({});
    }
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
});

router.put('/', adminAuthMiddleware, async (req, res) => {
  try {
    const { gstPercentage, gstEnabled, shippingFee, shippingEnabled, freeShippingAbove } = req.body;
    
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }
    
    if (gstPercentage !== undefined) settings.gstPercentage = gstPercentage;
    if (gstEnabled !== undefined) settings.gstEnabled = gstEnabled;
    if (shippingFee !== undefined) settings.shippingFee = shippingFee;
    if (shippingEnabled !== undefined) settings.shippingEnabled = shippingEnabled;
    if (freeShippingAbove !== undefined) settings.freeShippingAbove = freeShippingAbove;
    
    settings.updatedAt = new Date();
    await settings.save();
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
});

export default router;
