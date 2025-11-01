import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

const router = express.Router();

// Protect all analytics routes - admin only
router.use(authenticateAdmin);

// Get analytics data based on date range
router.get('/', async (req, res) => {
  try {
    const { dateRange = '7days' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch(dateRange) {
      case '24hours':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Fetch analytics data from different collections
    const orders = await Order.find({ createdAt: { $gte: startDate } });
    const users = await User.find({ createdAt: { $gte: startDate } });
    const allUsers = await User.find();

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const totalOrders = orders.length;
    const totalNewUsers = users.length;
    const totalUsers = allUsers.length;

    // Calculate order status breakdown
    const ordersByStatus = {
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };

    // Calculate average order value
    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;

    // Simulate page analytics (in real scenario, you would track page views)
    const analyticsData = [
      {
        pageId: 'home',
        pageName: '🏠 Homepage',
        views: Math.floor(Math.random() * 5000) + 2000,
        uniqueVisitors: Math.floor(Math.random() * 3000) + 1500,
        avgTimeSpent: (Math.random() * 3 + 1.5).toFixed(1),
        bounceRate: (Math.random() * 60 + 20).toFixed(1),
        lastUpdated: new Date()
      },
      {
        pageId: 'shop',
        pageName: '🛍️ Shop',
        views: Math.floor(Math.random() * 4000) + 1500,
        uniqueVisitors: Math.floor(Math.random() * 2500) + 1000,
        avgTimeSpent: (Math.random() * 4 + 2).toFixed(1),
        bounceRate: (Math.random() * 55 + 15).toFixed(1),
        lastUpdated: new Date()
      },
      {
        pageId: 'products',
        pageName: '📦 Products',
        views: Math.floor(Math.random() * 6000) + 2500,
        uniqueVisitors: Math.floor(Math.random() * 3500) + 1500,
        avgTimeSpent: (Math.random() * 5 + 2.5).toFixed(1),
        bounceRate: (Math.random() * 40 + 10).toFixed(1),
        lastUpdated: new Date()
      },
      {
        pageId: 'blogs',
        pageName: '📚 Blog',
        views: Math.floor(Math.random() * 2000) + 800,
        uniqueVisitors: Math.floor(Math.random() * 1200) + 500,
        avgTimeSpent: (Math.random() * 3 + 2).toFixed(1),
        bounceRate: (Math.random() * 50 + 25).toFixed(1),
        lastUpdated: new Date()
      },
      {
        pageId: 'cart',
        pageName: '🛒 Cart',
        views: Math.floor(Math.random() * 3000) + 1000,
        uniqueVisitors: Math.floor(Math.random() * 2000) + 700,
        avgTimeSpent: (Math.random() * 2 + 0.5).toFixed(1),
        bounceRate: (Math.random() * 70 + 40).toFixed(1),
        lastUpdated: new Date()
      },
      {
        pageId: 'checkout',
        pageName: '💳 Checkout',
        views: Math.floor(Math.random() * 2500) + 800,
        uniqueVisitors: Math.floor(Math.random() * 1500) + 600,
        avgTimeSpent: (Math.random() * 3 + 1.5).toFixed(1),
        bounceRate: (Math.random() * 60 + 30).toFixed(1),
        lastUpdated: new Date()
      },
      {
        pageId: 'wishlist',
        pageName: '❤️ Wishlist',
        views: Math.floor(Math.random() * 1500) + 500,
        uniqueVisitors: Math.floor(Math.random() * 1000) + 300,
        avgTimeSpent: (Math.random() * 2 + 0.8).toFixed(1),
        bounceRate: (Math.random() * 45 + 20).toFixed(1),
        lastUpdated: new Date()
      }
    ];

    // Add business metrics as a special entry
    const businessMetrics = {
      pageId: 'metrics',
      pageName: '📊 Business Metrics',
      views: totalOrders,
      uniqueVisitors: totalUsers,
      avgTimeSpent: avgOrderValue,
      bounceRate: totalNewUsers,
      lastUpdated: new Date(),
      details: {
        totalRevenue: totalRevenue.toFixed(2),
        totalOrders,
        totalNewUsers,
        totalUsers,
        avgOrderValue,
        ordersByStatus
      }
    };

    res.json({
      success: true,
      data: analyticsData,
      summary: {
        dateRange,
        startDate,
        endDate: now,
        businessMetrics
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

export default router;