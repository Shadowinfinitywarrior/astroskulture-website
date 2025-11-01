import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import Banner from '../models/Banner.js';

const router = express.Router();

// Get all active banners (public)
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true })
      .sort({ displayOrder: 1 })
      .lean();

    res.json({
      success: true,
      data: banners
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching banners',
      error: error.message
    });
  }
});

// Admin routes - Get all banners
router.get('/admin/all', authenticateAdmin, async (req, res) => {
  try {
    const banners = await Banner.find()
      .sort({ displayOrder: 1 })
      .lean();

    res.json({
      success: true,
      data: banners
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching banners',
      error: error.message
    });
  }
});

// Admin routes - Create banner
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { title, description, displayText, backgroundColor, textColor, link, imageUrl, isActive, discountPercentage } = req.body;

    if (!title || !displayText) {
      return res.status(400).json({
        success: false,
        message: 'Title and display text are required'
      });
    }

    const banner = new Banner({
      title,
      description,
      displayText,
      backgroundColor: backgroundColor || '#DC2626',
      textColor: textColor || '#FFFFFF',
      link,
      imageUrl,
      isActive: isActive !== undefined ? isActive : true,
      discountPercentage: discountPercentage || 0
    });

    await banner.save();

    res.status(201).json({
      success: true,
      data: banner
    });
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating banner',
      error: error.message
    });
  }
});

// Admin routes - Update banner
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    res.json({
      success: true,
      data: banner
    });
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating banner',
      error: error.message
    });
  }
});

// Admin routes - Delete banner
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    res.json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting banner',
      error: error.message
    });
  }
});

export default router;