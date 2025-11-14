import express from 'express';
import {
  createRazorpayOrder,
  verifyPayment,
  handlePaymentFailure,
  getPaymentDetails
} from '../controllers/paymentController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-order', auth, createRazorpayOrder);
router.post('/verify', auth, verifyPayment);
router.post('/failure', auth, handlePaymentFailure);
router.get('/details/:paymentId', auth, getPaymentDetails);

export default router;
