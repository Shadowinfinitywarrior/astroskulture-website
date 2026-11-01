// backend/src/controllers/magicCheckoutController.js
// Headless endpoints for Razorpay 1-Click Magic Checkout integration

import crypto from 'crypto';
import Razorpay from 'razorpay';
import Product from '../models/Product.js';
import AbandonedCart from '../models/AbandonedCart.js';

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
  const promotionsList = [
    {
      code: 'ASTROS10',
      title: '10% OFF Welcome Offer',
      description: 'Valid on orders above ₹999 across India',
      type: 'percent',
      value: 10,
    },
  ];

  return res.json({
    status: 'success',
    data: {
      promotions: promotionsList,
    },
    promotions: promotionsList,
  });
};

export const applyPromotion = async (req, res) => {
  try {
    const code = (req.body?.code || req.query?.code || '').toString().trim().toUpperCase();
    const line_items_total = Number(req.body?.line_items_total || req.body?.order_amount || req.query?.order_amount || 0);

    if (code === 'ASTROS10') {
      if (line_items_total > 0 && line_items_total < 99900) {
        return res.json({
          status: 'error',
          valid: false,
          message: 'Minimum order amount of ₹999 required for coupon ASTROS10',
        });
      }

      const discountPaise = line_items_total >= 99900 ? Math.round(line_items_total * 0.10) : 10000;
      return res.json({
        status: 'success',
        valid: true,
        code: 'ASTROS10',
        discount: discountPaise,
        discount_amount: discountPaise,
        data: {
          valid: true,
          code: 'ASTROS10',
          discount: discountPaise,
          discount_amount: discountPaise,
        },
      });
    }

    return res.json({
      status: 'error',
      valid: false,
      message: 'Invalid coupon code',
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

/**
 * 5. Abandoned Cart Webhook: POST /api/payments/magic/abandoned-cart
 * Receives dropped checkout events from Razorpay Magic Checkout
 * Schedules 1st reminder at 30 minutes, 2nd reminder at 24 hours
 */
export const handleAbandonedCartWebhook = async (req, res) => {
  try {
    const payload = req.body || {};
    const customer = payload.customer || payload.user || {};
    const contact = (customer.contact || customer.phone || payload.contact || '').toString().trim();
    const email = (customer.email || payload.email || '').toString().trim();
    const name = customer.name || customer.fullName || 'Customer';

    const lineItems = payload.line_items || payload.items || [];
    const orderAmount = Number(payload.order_amount || payload.amount || 0);

    const formattedItems = Array.isArray(lineItems)
      ? lineItems.map((item) => ({
          name: item.name || item.title || 'Astros Kulture Apparel',
          price: (Number(item.price || item.unit_amount || 0) > 1000) ? Math.round(Number(item.price || item.unit_amount) / 100) : Number(item.price || 0),
          quantity: Number(item.quantity || 1),
          size: item.size || 'M',
          color: item.color || '',
          image: item.image_url || item.image || '',
        }))
      : [];

    const now = new Date();
    const firstNotificationScheduledAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes
    const secondNotificationScheduledAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    const recoveryToken = crypto.randomBytes(16).toString('hex');
    const recoveryUrl = `https://astroskulture.in/api/payments/magic/recover/${recoveryToken}`;

    const cartTotalRupees = orderAmount > 1000 ? Math.round(orderAmount / 100) : orderAmount;

    // Save or update abandoned cart record
    const cart = await AbandonedCart.findOneAndUpdate(
      {
        $or: [
          ...(contact ? [{ 'customer.phone': contact, status: { $ne: 'recovered' } }] : []),
          ...(email ? [{ 'customer.email': email, status: { $ne: 'recovered' } }] : []),
          ...(payload.order_id ? [{ razorpayOrderId: payload.order_id }] : []),
        ],
      },
      {
        $setOnInsert: {
          recoveryToken,
          recoveryUrl,
          firstNotificationScheduledAt,
          secondNotificationScheduledAt,
          status: 'abandoned',
        },
        customer: { name, phone: contact, email },
        items: formattedItems,
        cartTotal: cartTotalRupees,
        razorpayOrderId: payload.order_id || payload.razorpay_order_id,
        metadata: payload,
      },
      { upsert: true, new: true }
    );

    console.log(`🛒 [Abandoned Cart Captured] ID: ${cart._id} | Contact: ${contact || email} | 1st reminder in 30m, 2nd in 24h`);

    return res.status(200).json({
      status: 'success',
      message: 'Abandoned cart logged and recovery schedule activated',
      cartId: cart._id,
    });
  } catch (error) {
    console.error('[Abandoned Cart Webhook Error]', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * 6. Order Creation Webhook: POST /api/payments/magic/order-created
 * Fired by Razorpay when an order is created or confirmed
 * Immediately clears pending abandoned cart reminders for this customer
 */
export const handleOrderCreatedWebhook = async (req, res) => {
  try {
    const payload = req.body || {};
    const customer = payload.customer || {};
    const phone = customer.contact || customer.phone || payload.phone || '';
    const email = customer.email || payload.email || '';
    const rzpOrderId = payload.order_id || payload.razorpay_order_id || payload.id;

    // Mark matching abandoned carts as recovered so no further reminder messages are sent
    const recoveryFilter = {
      $or: [
        ...(rzpOrderId ? [{ razorpayOrderId: rzpOrderId }] : []),
        ...(phone ? [{ 'customer.phone': phone }] : []),
        ...(email ? [{ 'customer.email': email }] : []),
      ],
    };

    if (recoveryFilter.$or.length > 0) {
      const recovered = await AbandonedCart.updateMany(recoveryFilter, {
        $set: {
          status: 'recovered',
          recoveredAt: new Date(),
        },
      });
      if (recovered.modifiedCount > 0) {
        console.log(`✅ [Cart Recovered] Customer completed order! Cleared ${recovered.modifiedCount} abandoned cart reminder(s).`);
      }
    }

    return res.status(200).json({
      status: 'success',
      message: 'Order creation webhook processed',
    });
  } catch (error) {
    console.error('[Order Created Webhook Error]', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * 7. Recovery Link Click Tracker: GET /api/payments/magic/recover/:token
 * Marks the cart as opened when the customer clicks the notification link
 * Then redirects the customer back to the website checkout
 */
export const recoverAbandonedCart = async (req, res) => {
  try {
    const { token } = req.params;
    const cart = await AbandonedCart.findOne({ recoveryToken: token });

    if (cart) {
      cart.customerOpenedAt = new Date();
      cart.status = 'opened';
      await cart.save();
      console.log(`🔗 [Cart Opened] Customer clicked recovery link for cart ${cart._id}`);
    }

    return res.redirect('https://astroskulture.in/cart?recovered=true');
  } catch (error) {
    console.error('[Recover Cart Error]', error);
    return res.redirect('https://astroskulture.in/cart');
  }
};
