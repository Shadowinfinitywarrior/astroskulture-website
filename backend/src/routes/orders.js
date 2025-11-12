import express from 'express';
import {
  getAllOrders,
  getOrderById,
  getUserOrders,
  createOrder,
  updateOrderStatus,
  updatePaymentStatus
} from '../controllers/orderController.js';
import { auth } from '../middleware/auth.js'; // Import auth middleware

const router = express.Router();

// All order routes require authentication
router.get('/', auth, getAllOrders);
router.get('/my-orders', auth, getUserOrders);
router.get('/:id', auth, getOrderById);
router.post('/', auth, createOrder);
router.put('/:id/status', auth, updateOrderStatus);
router.put('/:id/payment', auth, updatePaymentStatus);

export default router;