import Order from '../models/Order.js';
import Product from '../models/Product.js';

export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('userId', 'email fullName phone')
      .populate('items.productId', 'name images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'email fullName phone addresses')
      .populate('items.productId', 'name images slug');
    
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
    console.error('Get order error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const orders = await Order.find({ userId: req.user.id })
      .populate('items.productId', 'name images slug')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

export const createOrder = async (req, res) => {
  try {
    // Update product stock
    for (const item of req.body.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const sizeIndex = product.sizes.findIndex(s => s.size === item.size);
        if (sizeIndex !== -1 && product.sizes[sizeIndex].stock >= item.quantity) {
          product.sizes[sizeIndex].stock -= item.quantity;
          await product.save();
        } else {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name} (size: ${item.size})`
          });
        }
      }
    }

    const orderData = {
      ...req.body,
      userId: req.user?.id
    };

    if (!orderData.orderNumber) {
      const date = new Date();
      const timestamp = date.getTime();
      const random = Math.floor(Math.random() * 1000);
      orderData.orderNumber = `ORD-${timestamp}-${random}`;
    }

    const order = new Order(orderData);
    
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('userId', 'email fullName phone')
      .populate('items.productId', 'name images');

    res.status(201).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Invalid order data', 
      error: error.message 
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Find the order first to check ownership and state
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Check ownership unless admin
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin && order.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // Regular users can only cancel pending orders
    if (!isAdmin) {
      if (status !== 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Users can only cancel orders'
        });
      }
      if (order.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Only pending orders can be cancelled'
        });
      }
    }

    const oldStatus = order.status;
    order.status = status;
    order.updatedAt = Date.now();
    await order.save();

    // Restore stock if status changed to cancelled
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          const sizeIndex = product.sizes?.findIndex(s => s.size === item.size);
          if (sizeIndex !== -1) {
            product.sizes[sizeIndex].stock += item.quantity;
            await product.save();
            console.log(`✅ Restored stock for ${product.name} (size: ${item.size}): +${item.quantity}`);
          }
        }
      }
    }

    // Populate for response
    const populatedOrder = await Order.findById(order._id)
      .populate('userId', 'email fullName phone')
      .populate('items.productId', 'name images');

    res.json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Invalid order status update', 
      error: error.message 
    });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentId } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, paymentId, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
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
    console.error('Update payment status error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Invalid payment data', 
      error: error.message 
    });
  }
};

export const updateOrderPrices = async (req, res) => {
  try {
    const { subtotal, tax, shipping, total } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        subtotal: subtotal !== undefined ? subtotal : undefined,
        tax: tax !== undefined ? tax : undefined,
        shipping: shipping !== undefined ? shipping : undefined,
        total: total !== undefined ? total : undefined,
        updatedAt: Date.now() 
      },
      { new: true, runValidators: false }
    )
      .populate('userId', 'email fullName phone')
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
    console.error('Update order prices error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Invalid order data', 
      error: error.message 
    });
  }
};