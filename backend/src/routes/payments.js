import express from 'express';
import {
  createRazorpayOrder,
  verifyPayment,
  handlePaymentFailure,
  getPaymentDetails,
  handlePaymentWebhook
} from '../controllers/paymentController.js';
import {
  createMagicOrder,
  getPromotions,
  applyPromotion,
  getShippingInfo
} from '../controllers/magicCheckoutController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Standard Checkout routes
router.post('/create-order', auth, createRazorpayOrder);
router.post('/verify', auth, verifyPayment);
router.post('/failure', auth, handlePaymentFailure);
router.post('/webhook', handlePaymentWebhook);
router.get('/details/:paymentId', auth, getPaymentDetails);

// Razorpay 1-Click Magic Checkout headless endpoints
router.post('/magic/create-order', createMagicOrder);
router.all('/magic/promotions', getPromotions);
router.all('/magic/apply-promotion', applyPromotion);
router.all('/magic/shipping-info', getShippingInfo);

export default router;
