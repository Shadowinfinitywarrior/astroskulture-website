import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';

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

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'paid',
        paymentId: razorpayPaymentId,
        updatedAt: Date.now()
      },
      { new: true }
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
      message: 'Payment verified successfully',
      data: order
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

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'failed',
        paymentId: razorpayPaymentId || null,
        updatedAt: Date.now()
      },
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
      message: 'Payment failure recorded',
      data: order
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
