import express from 'express';
import {
  getAllProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
  getAllProductsDebug,
  getCategoriesWithCounts
} from '../controllers/productController.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:slug', getProductsByCategory);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);
router.get('/debug/all', getAllProductsDebug); // Debug route to see all products
router.get('/categories/with-counts', getCategoriesWithCounts); // Categories with product counts

// Admin routes (should be protected with auth middleware)
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;