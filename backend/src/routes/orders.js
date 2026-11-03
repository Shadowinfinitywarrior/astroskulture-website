import express from 'express';
import {
  getOrderById,
  getUserOrders,
  createOrder,
  updateOrderStatus,
  updatePaymentStatus
} from '../controllers/orderController.js';
import { auth, authenticateOptional } from '../middleware/auth.js';

const router = express.Router();

// User-specific orders list requires auth
router.get('/my-orders', auth, getUserOrders);

// Order lookup and creation support both authenticated users and guests
router.get('/:id', authenticateOptional, getOrderById);
router.post('/', authenticateOptional, createOrder);

// Status updates require auth
router.put('/:id/status', auth, updateOrderStatus);
router.put('/:id/payment', auth, updatePaymentStatus);

export default router;