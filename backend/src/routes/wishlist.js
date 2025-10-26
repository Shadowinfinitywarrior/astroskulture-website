import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus,
  getWishlistCount,
  clearWishlist,
  addMultipleToWishlist
} from '../controllers/wishlistController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected with regular user authentication
router.use(auth);

// GET /api/wishlist - Get user's complete wishlist with product details
router.get('/', getWishlist);

// GET /api/wishlist/count - Get the count of items in user's wishlist
router.get('/count', getWishlistCount);

// POST /api/wishlist - Add a single product to wishlist
router.post('/', addToWishlist);

// POST /api/wishlist/bulk - Add multiple products to wishlist at once
router.post('/bulk', addMultipleToWishlist);

// GET /api/wishlist/check/:productId - Check if a specific product is in user's wishlist
router.get('/check/:productId', checkWishlistStatus);

// DELETE /api/wishlist/:productId - Remove a specific product from wishlist
router.delete('/:productId', removeFromWishlist);

// DELETE /api/wishlist - Clear user's entire wishlist
router.delete('/', clearWishlist);

// Health check endpoint for wishlist routes
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Wishlist routes are working',
    timestamp: new Date().toISOString(),
    user: req.user.id,
    endpoints: {
      getWishlist: 'GET /',
      getCount: 'GET /count',
      addItem: 'POST /',
      addMultiple: 'POST /bulk',
      checkStatus: 'GET /check/:productId',
      removeItem: 'DELETE /:productId',
      clearAll: 'DELETE /'
    }
  });
});

export default router;