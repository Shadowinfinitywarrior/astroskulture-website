import mongoose from 'mongoose';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Settings from '../models/Settings.js';

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
    const isAdmin = req.user && req.user.role === 'admin';

    const orderQuery = isAdmin
      ? { _id: req.params.id }
      : req.user
        ? { $or: [{ _id: req.params.id, userId: req.user.id }, { _id: req.params.id, userId: { $exists: false } }] }
        : { _id: req.params.id };

    const order = await Order.findOne(orderQuery)
      .populate('userId', 'email fullName phone addresses')
      .populate('items.productId', 'name images slug');
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found or not authorized' 
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
  const isReplicaSet = Boolean(
    mongoose.connection?.client?.topology?.description?.setName ||
    mongoose.connection?.client?.topology?.s?.replicaSet
  );

  let session = null;
  if (isReplicaSet) {
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch {
      session = null;
    }
  }

  const sessionOption = session ? { session } : {};

  try {
    const { items, shippingAddress, paymentStatus = 'pending' } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      if (session) await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Fetch settings for GST and shipping
    let settings = await Settings.findOne().sort({ updatedAt: -1 });
    if (!settings) {
      settings = await Settings.create({});
    }
    const gstEnabled = settings.gstEnabled !== undefined ? settings.gstEnabled : true;
    const gstPercentage = settings.gstPercentage !== undefined ? settings.gstPercentage : 18;
    const shippingFee = settings.shippingFee !== undefined ? settings.shippingFee : 0;
    const freeShippingAbove = settings.freeShippingAbove !== undefined ? settings.freeShippingAbove : 999;

    // Validate items and calculate server-side totals
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.productId || !item.quantity || !item.size) {
        if (session) await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: 'Each item must have productId, quantity, and size'
        });
      }

      let productQuery = Product.findById(item.productId);
      if (session) productQuery = productQuery.session(session);
      const product = await productQuery;

      if (!product || !product.isActive) {
        if (session) await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Product not found or inactive: ${item.productId}`
        });
      }

      const sizeIndex = product.sizes.findIndex(s => s.size === item.size);
      if (sizeIndex === -1) {
        if (session) await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Size ${item.size} not available for ${product.name}`
        });
      }

      if (product.sizes[sizeIndex].stock < item.quantity) {
        if (session) await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name} (size: ${item.size})`
        });
      }

      // Decrement stock
      product.sizes[sizeIndex].stock -= item.quantity;
      product.totalStock -= item.quantity;
      await product.save(sessionOption);

      const verifiedUnitPrice = (product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price)
        ? product.discountPrice
        : product.price;
      const itemSubtotal = verifiedUnitPrice * item.quantity;
      subtotal += itemSubtotal;

      validatedItems.push({
        productId: product._id,
        name: product.name,
        price: verifiedUnitPrice,
        quantity: item.quantity,
        size: item.size,
        color: item.color || ''
      });
    }

    // Calculate tax and shipping server-side
    let tax = 0;
    if (gstEnabled) {
      tax = Math.round(subtotal * (gstPercentage / 100));
    }

    let shipping = 0;
    if (subtotal < freeShippingAbove) {
      shipping = shippingFee;
    }

    const total = subtotal + tax + shipping;

    const isCod = req.body.paymentMethod === 'cod';
    const orderData = {
      items: validatedItems,
      userId: req.user ? req.user.id : undefined,
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress,
      paymentMethod: isCod ? 'cod' : 'razorpay',
      paymentStatus: isCod ? 'pending' : paymentStatus,
      status: isCod ? 'processing' : 'pending',
      eventId: req.body.eventId || crypto.randomUUID(),
      fbp: req.body.fbp || '',
      fbc: req.body.fbc || '',
      purchaseTracked: false
    };

    if (!orderData.orderNumber) {
      const date = new Date();
      const timestamp = date.getTime();
      const random = Math.floor(Math.random() * 1000);
      orderData.orderNumber = `ORD-${timestamp}-${random}`;
    }

    const order = new Order(orderData);
    await order.save(sessionOption);

    if (session) {
      await session.commitTransaction();
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('userId', 'email fullName phone')
      .populate('items.productId', 'name images');

    res.status(201).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch {
        // Ignore abort errors
      }
    }
    console.error('Create order error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Invalid order data', 
      error: error.message 
    });
  } finally {
    if (session) {
      try {
        session.endSession();
      } catch {
        // Ignore session cleanup errors
      }
    }
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

    // Only admins can update payment status directly
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update payment status'
      });
    }

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