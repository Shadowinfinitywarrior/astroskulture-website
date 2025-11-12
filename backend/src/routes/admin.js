import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Category from '../models/Category.js';

const router = express.Router();

// Protect all admin routes
router.use(authenticateAdmin);

// Admin products routes
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find()
      .populate({
        path: 'category',
        select: 'name slug'
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

router.post('/products', async (req, res) => {
  try {
    // Rename categoryId to category for the model
    if (req.body.categoryId && !req.body.category) {
      req.body.category = req.body.categoryId;
      delete req.body.categoryId;
    }
    
    // Calculate totalStock from sizes if provided
    if (req.body.sizes && Array.isArray(req.body.sizes)) {
      req.body.totalStock = req.body.sizes.reduce((total, size) => total + (size.stock || 0), 0);
    }

    // Validate required fields
    if (!req.body.name || !req.body.description || !req.body.price || !req.body.category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, description, price, category'
      });
    }

    // Validate category exists
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    // Handle duplicate slug by adding timestamp suffix
    let slug = req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const baseSlug = slug;
    let count = 0;
    while (true) {
      try {
        const product = new Product({
          ...req.body,
          slug
        });
        await product.save();

        const populatedProduct = await Product.findById(product._id)
          .populate({
            path: 'category',
            select: 'name slug'
          })
          .lean();

        return res.status(201).json({
          success: true,
          data: populatedProduct
        });
      } catch (error) {
        // If duplicate slug error, retry with modified slug
        if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
          count++;
          slug = `${baseSlug}-${count}`;
          continue;
        }
        throw error;
      }
    }
  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating product',
      error: error.message,
      details: error.errors ? Object.keys(error.errors).join(', ') : null
    });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    // Rename categoryId to category for the model
    if (req.body.categoryId && !req.body.category) {
      req.body.category = req.body.categoryId;
      delete req.body.categoryId;
    }
    
    // Calculate totalStock from sizes if provided
    if (req.body.sizes && Array.isArray(req.body.sizes)) {
      req.body.totalStock = req.body.sizes.reduce((total, size) => total + (size.stock || 0), 0);
    }

    // Validate category exists if provided
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID'
        });
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
    .populate({
      path: 'category',
      select: 'name slug'
    })
    .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
});

// Admin categories routes
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
});

router.put('/categories/:id', async (req, res) => {
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
    console.error('Error updating category:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
});

router.delete('/categories/:id', async (req, res) => {
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
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
});

// Admin orders routes
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'email fullName')
      .populate('items.productId', 'name images')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    )
    .populate('user', 'email fullName')
    .populate('items.productId', 'name images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
});

router.delete('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', updatedAt: Date.now() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting order',
      error: error.message
    });
  }
});

// Admin users routes
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

router.post('/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();

    // Return user without password
    const userWithoutPassword = await User.findById(user._id).select('-password');
    
    res.status(201).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    // Don't allow password updates through this route
    const { password, ...updateData } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // First delete related data
    const Wishlist = (await import('../models/Wishlist.js')).default;
    const Review = (await import('../models/Review.js')).default;
    
    // Delete user's wishlist items
    await Wishlist.deleteMany({ userId });
    
    // Delete user's reviews
    await Review.deleteMany({ userId });
    
    // Delete user's orders (optional - you might want to keep order history)
    // Uncomment the following line if you want to delete orders when user is deleted
    // await Order.deleteMany({ userId });
    
    // Now delete the user
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User and associated data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// Admin dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalCategories = await Category.countDocuments({ isActive: true });

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get low stock products
    const lowStockProducts = await Product.find({
      $or: [
        { totalStock: { $lte: 10 } },
        { 'sizes.stock': { $lte: 5 } }
      ],
      isActive: true
    })
    .populate({
      path: 'category',
      select: 'name'
    })
    .limit(10)
    .lean();

    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      success: true,
      data: {
        totalProducts,
        totalUsers,
        totalOrders,
        totalCategories,
        totalRevenue,
        recentOrders,
        lowStockProducts
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
});

export default router;