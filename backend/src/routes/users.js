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
import { auth } from '../middleware/auth.js'; // Import auth middleware

const router = express.Router();

// Public routes (if any)

// Protected routes - require authentication
router.get('/profile', auth, getCurrentUser);
router.put('/profile', auth, updateProfile);
router.post('/address', auth, addAddress);
router.put('/address/:addressId', auth, updateAddress);

// Admin only routes (add admin check if needed)
router.get('/', auth, getAllUsers);
router.get('/:id', auth, getUserById);
router.delete('/:id', auth, deleteUser);

export default router;