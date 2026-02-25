import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const validateRazorpayConfig = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET_KEY) {
    console.error('❌ Razorpay configuration missing:');
    console.error('   RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✓' : '✗ MISSING');
    console.error('   RAZORPAY_SECRET_KEY:', process.env.RAZORPAY_SECRET_KEY ? '✓' : '✗ MISSING');
    return false;
  }
  return true;
};

const getRazorpayInstance = () => {
  if (!validateRazorpayConfig()) {
    throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_SECRET_KEY environment variables.');
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY
  });
};

export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId, amount, currency = 'INR' } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and amount are required'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const razorpay = getRazorpayInstance();

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: `order_${orderId}`,
      notes: {
        orderId,
        orderNumber: order.orderNumber
      }
    });

    await Order.findByIdAndUpdate(
      orderId,
      { razorpayOrderId: razorpayOrder.id }
    );

    res.json({
      success: true,
      data: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt
      }
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);

    if (error.message.includes('Razorpay is not configured')) {
      return res.status(500).json({
        success: false,
        message: 'Payment service is not configured',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    if (!orderId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment details'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already processed for this order'
      });
    }

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      console.warn('❌ Invalid signature for order:', orderId);
      console.warn('Expected:', expectedSignature);
      console.warn('Received:', razorpaySignature);
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature - payment verification failed'
      });
    }

    const razorpay = getRazorpayInstance();
    const paymentDetails = await razorpay.payments.fetch(razorpayPaymentId);

    if (paymentDetails.amount !== Math.round(order.total * 100)) {
      console.error('❌ Amount mismatch for order:', orderId);
      console.error('Expected:', order.total * 100);
      console.error('Received:', paymentDetails.amount);
      return res.status(400).json({
        success: false,
        message: 'Payment amount does not match order total'
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'paid',
        paymentId: razorpayPaymentId,
        razorpayOrderId: razorpayOrderId,
        status: 'processing',
        updatedAt: Date.now()
      },
      { new: true }
    )
      .populate('userId', 'email fullName phone')
      .populate('items.productId', 'name images');

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found after update'
      });
    }

    console.log('✅ Payment verified successfully for order:', orderId);

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};

export const handlePaymentFailure = async (req, res) => {
  try {
    const { orderId, razorpayPaymentId, reason } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot mark as failed - payment already processed'
      });
    }

    await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'failed',
        paymentId: razorpayPaymentId || null,
        status: 'cancelled',
        updatedAt: Date.now()
      },
      { new: true }
    );

    console.log('❌ Payment failure recorded for order:', orderId, 'Reason:', reason);

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

    const updatedOrder = await Order.findById(orderId);

    res.json({
      success: true,
      message: 'Payment failure recorded and stock restored',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error handling payment failure:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record payment failure',
      error: error.message
    });
  }
};

export const handlePaymentWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_SECRET_KEY;
    const signature = req.headers['x-razorpay-signature'];
    const body = req.rawBody || JSON.stringify(req.body);

    if (!signature || !webhookSecret) {
      console.warn('❌ Missing webhook signature or secret');
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook'
      });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('❌ Invalid webhook signature - mismatch');
      console.warn('Expected:', expectedSignature);
      console.warn('Received:', signature);
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const { event, payload } = req.body;

    if (!event || !payload) {
      console.warn('❌ Webhook missing event or payload');
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook payload'
      });
    }

    const paymentEntity = payload.payment?.entity;

    if (!paymentEntity) {
      console.warn('❌ Webhook missing payment entity');
      return res.status(400).json({
        success: false,
        message: 'Missing payment details'
      });
    }

    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;
    const paymentStatusRaw = paymentEntity.status;

    if (!razorpayOrderId || !razorpayPaymentId) {
      console.warn('❌ Incomplete webhook payment data:', { razorpayOrderId, razorpayPaymentId });
      return res.status(400).json({
        success: false,
        message: 'Incomplete payment data'
      });
    }

    let paymentStatus = 'pending';
    if (paymentStatusRaw === 'captured' || event === 'payment.authorized') {
      paymentStatus = 'paid';
    } else if (paymentStatusRaw === 'failed' || event === 'payment.failed') {
      paymentStatus = 'failed';
    }

    const order = await Order.findOne({ razorpayOrderId });

    if (!order) {
      console.warn('⚠️  Order not found for webhook:', razorpayOrderId);
      return res.status(200).json({
        success: true,
        message: 'Webhook received - order not found in DB (might sync later)'
      });
    }

    if (order.paymentStatus === 'paid' && paymentStatus === 'paid') {
      console.log('ℹ️  Duplicate webhook received for paid order:', razorpayOrderId);
      return res.status(200).json({
        success: true,
        message: 'Webhook already processed'
      });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { razorpayOrderId },
      {
        paymentStatus,
        paymentId: razorpayPaymentId,
        status: paymentStatus === 'paid' ? 'processing' : 'pending',
        updatedAt: Date.now()
      },
      { new: true }
    )
      .populate('userId', 'email fullName')
      .populate('items.productId', 'name');

    console.log('✅ Webhook processed successfully:', {
      event,
      orderId: updatedOrder._id,
      paymentId: razorpayPaymentId,
      paymentStatus,
      orderStatus: updatedOrder.status
    });

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook',
      error: error.message
    });
  }
};

export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    const razorpay = getRazorpayInstance();
    const payment = await razorpay.payments.fetch(paymentId);

    res.json({
      success: true,
      data: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        description: payment.description,
        fee: payment.fee,
        tax: payment.tax,
        receiptId: payment.receipt,
        createdAt: payment.created_at
      }
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);

    if (error.message.includes('Razorpay is not configured')) {
      return res.status(500).json({
        success: false,
        message: 'Payment service is not configured',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message
    });
  }
};

export const syncPendingOrders = async (req, res) => {
  try {
    console.log('🔄 Starting manual synchronization of pending orders...');

    // Find orders where paymentStatus is 'pending', status is 'pending', and razorpayOrderId is present
    const pendingOrders = await Order.find({
      paymentStatus: 'pending',
      status: 'pending',
      razorpayOrderId: { $exists: true, $ne: null }
    });

    console.log(`📊 Found ${pendingOrders.length} pending orders to check.`);

    if (pendingOrders.length === 0) {
      return res.json({
        success: true,
        message: 'No pending orders found that require synchronization.',
        data: { syncedCount: 0, updatedCount: 0 }
      });
    }

    const razorpay = getRazorpayInstance();
    let updatedCount = 0;
    const results = [];

    for (const order of pendingOrders) {
      try {
        console.log(`🔍 Checking Razorpay for Order: ${order.orderNumber} (Razorpay ID: ${order.razorpayOrderId})`);

        // Fetch all payments for this Razorpay order
        const payments = await razorpay.orders.fetchPayments(order.razorpayOrderId);

        // Look for a successful (captured or authorized) payment
        const successfulPayment = payments.items.find(p =>
          p.status === 'captured' || p.status === 'authorized'
        );

        if (successfulPayment) {
          console.log(`✅ Found successful payment for ${order.orderNumber}: ${successfulPayment.id}`);

          // Update order status
          await Order.findByIdAndUpdate(order._id, {
            paymentStatus: 'paid',
            paymentId: successfulPayment.id,
            status: 'processing',
            updatedAt: Date.now()
          });

          updatedCount++;
          results.push({
            orderNumber: order.orderNumber,
            status: 'updated',
            razorpayPaymentId: successfulPayment.id
          });
        } else {
          // Check if order is old (e.g., > 24 hours) and mark as failed if no payment found
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          if (order.createdAt < oneDayAgo) {
            console.log(`⚠️ Order ${order.orderNumber} is older than 24h and no payment found. Marking as failed.`);

            await Order.findByIdAndUpdate(order._id, {
              paymentStatus: 'failed',
              status: 'cancelled',
              updatedAt: Date.now()
            });

            // Restore stock
            for (const item of order.items) {
              const product = await Product.findById(item.productId);
              if (product) {
                const sizeIndex = product.sizes?.findIndex(s => s.size === item.size);
                if (sizeIndex !== -1) {
                  product.sizes[sizeIndex].stock += item.quantity;
                  await product.save();
                }
              }
            }

            results.push({
              orderNumber: order.orderNumber,
              status: 'cancelled (timeout)',
              reason: 'No payment found within 24h'
            });
          } else {
            results.push({
              orderNumber: order.orderNumber,
              status: 'pending',
              reason: 'No capture found yet'
            });
          }
        }

        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (err) {
        console.error(`❌ Error syncing order ${order.orderNumber}:`, err.message);
        results.push({
          orderNumber: order.orderNumber,
          status: 'error',
          error: err.message
        });
      }
    }

    console.log(`✅ Sync complete. Updated ${updatedCount} orders.`);

    res.json({
      success: true,
      message: `Sync complete. ${updatedCount} orders were updated to 'paid'.`,
      data: {
        syncedCount: pendingOrders.length,
        updatedCount,
        details: results
      }
    });

  } catch (error) {
    console.error('❌ Global error in syncPendingOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to synchronize pending orders',
      error: error.message
    });
  }
};
