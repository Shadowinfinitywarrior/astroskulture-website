import express from 'express';
import {
  getAllUsers,
  getUserById,
  getCurrentUser,
  updateProfile,
  addAddress,
  updateAddress,
  deleteUser
} from '../controllers/userController.js';
import { auth, authenticateAdmin } from '../middleware/auth.js'; // Import auth middleware

const router = express.Router();

// Public routes (if any)

// Protected routes - require authentication
router.get('/profile', auth, getCurrentUser);
router.put('/profile', auth, updateProfile);
router.post('/address', auth, addAddress);
router.put('/address/:addressId', auth, updateAddress);

// Admin only routes
router.get('/', auth, authenticateAdmin, getAllUsers);
router.get('/:id', auth, authenticateAdmin, getUserById);
router.delete('/:id', auth, authenticateAdmin, deleteUser);

export default router;