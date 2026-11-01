// backend/src/controllers/magicCheckoutController.js
// Headless endpoints for Razorpay 1-Click Magic Checkout integration

import Razorpay from 'razorpay';
import Product from '../models/Product.js';

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET_KEY) {
    throw new Error('Razorpay keys not configured');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
  });
};

/**
 * 1. Create Magic Order: POST /api/payments/magic/create-order
 */
export const createMagicOrder = async (req, res) => {
  try {
    const { items = [] } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items provided' });
    }

    let lineItemsTotal = 0;
    const magicLineItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      }

      // Authoritative pricing from database
      const unitPriceRupees = (product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price)
        ? product.discountPrice
        : product.price;

      const unitPricePaise = Math.round(unitPriceRupees * 100);
      lineItemsTotal += unitPricePaise * item.quantity;

      magicLineItems.push({
        sku: `${product.slug}-${item.size || 'free'}`,
        variant_id: `${product._id}_${item.size || 'free'}`,
        name: product.name,
        price: Math.round(product.price * 100),
        offer_price: unitPricePaise,
        quantity: item.quantity || 1,
        image_url: product.images?.[0]?.url || 'https://astroskulture.in/logo.png',
        product_url: `https://astroskulture.in/product/${product.slug}`,
      });
    }

    const razorpay = getRazorpayInstance();

    // Create Razorpay order with mandatory line_items_total
    const rzpOrder = await razorpay.orders.create({
      amount: lineItemsTotal,
      currency: 'INR',
      receipt: `ORD-MAGIC-${Date.now()}`,
      line_items_total: lineItemsTotal,
      line_items: magicLineItems,
      notes: {
        isMagicCheckout: 'true',
        item_count: String(items.length),
      },
    });

    res.json({
      success: true,
      data: {
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
      },
    });
  } catch (error) {
    console.error('[Magic createOrder Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Public Promotions Endpoint: GET /api/payments/magic/promotions
 */
export const getPromotions = async (req, res) => {
  res.json({
    promotions: [
      {
        code: 'ASTROS10',
        title: '10% OFF Welcome Offer',
        description: 'Valid Pan-India on orders above ₹999',
        type: 'percent',
        value: 10,
      },
    ],
  });
};

/**
 * 3. Apply Promotion Endpoint: POST /api/payments/magic/apply-promotion
 */
export const applyPromotion = async (req, res) => {
  try {
    const { code, line_items_total } = req.body;

    if (code && code.toUpperCase() === 'ASTROS10' && line_items_total >= 99900) {
      const discountPaise = Math.round(line_items_total * 0.10);
      return res.json({ valid: true, code: 'ASTROS10', discount: discountPaise });
    }

    return res.json({
      valid: false,
      message: 'Invalid coupon code or minimum order amount of ₹999 not met.',
    });
  } catch (error) {
    res.status(500).json({ valid: false, message: error.message });
  }
};

/**
 * 4. Shipping Info & COD Serviceability: POST /api/payments/magic/shipping-info
 * Fully compatible with Razorpay Magic Checkout Custom Platform specification
 */
export const getShippingInfo = async (req, res) => {
  try {
    const { order_amount, addresses = [], line_items = [] } = req.body;

    // Calculate total order amount in paise
    let totalPaise = Number(order_amount) || 0;
    if (!totalPaise && Array.isArray(line_items) && line_items.length > 0) {
      totalPaise = line_items.reduce((acc, item) => acc + (Number(item.price || item.offer_price || 0) * (item.quantity || 1)), 0);
    }

    // Free shipping Pan-India above ₹999 (99900 paise)
    const isFreeShipping = totalPaise >= 99900;
    const shippingFeeRupees = isFreeShipping ? 0 : 69;
    const isCodAvailable = totalPaise > 0 ? totalPaise <= 300000 : true; // Under ₹3,000

    const addressList = Array.isArray(addresses) && addresses.length > 0
      ? addresses
      : [{ id: 'default', pincode: req.body.pincode }];

    const formattedAddresses = addressList.map((addr) => ({
      id: addr.id || 'default',
      serviceable: true,
      cod: isCodAvailable,
      shipping_fee: shippingFeeRupees,
      cod_fee: 0,
      estimated_delivery_days: 4
    }));

    // Return unified payload satisfying all Razorpay Magic schema variants
    return res.json({
      status: 'success',
      data: {
        addresses: formattedAddresses
      },
      serviceable: true,
      shipping_fee: shippingFeeRupees,
      cod_available: isCodAvailable,
      cod_fee: 0,
      estimated_delivery_days: 4
    });
  } catch (error) {
    console.error('[Magic getShippingInfo Error]', error);
    return res.status(500).json({ status: 'error', serviceable: false, message: error.message });
  }
};
