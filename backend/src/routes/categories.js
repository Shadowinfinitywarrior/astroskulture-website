import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

// Get all active categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// Get all categories (including inactive - for admin)
router.get('/all', async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ displayOrder: 1, name: 1 });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch all categories',
      error: error.message
    });
  }
});

// Get category by slug
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.slug,
      isActive: true 
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
});

// Create category (Admin only)
router.post('/', async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
});

// Update category (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
});

// Delete category (Admin only - soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
});

export default router;