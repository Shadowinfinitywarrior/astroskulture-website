import express from 'express';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all reviews for a product (public)
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
});

// Create a review (authenticated users only)
router.post('/', auth, async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!productId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and rating are required'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product. You can update your existing review.'
      });
    }

    // Check if user purchased this product (optional - for verified purchase badge)
    const hasPurchased = await Order.findOne({
      userId,
      'items.productId': productId,
      status: { $in: ['delivered', 'processing', 'shipped'] }
    });

    // Create review
    const review = new Review({
      productId,
      userId,
      rating,
      title,
      comment,
      isVerifiedPurchase: !!hasPurchased
    });

    await review.save();

    // Populate user info before sending response
    await review.populate('userId', 'fullName email');

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review submitted successfully'
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
});

// Update a review (authenticated users only)
router.put('/:reviewId', auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user.id;

    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns this review
    if (review.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }

    // Update review
    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment;
    review.updatedAt = Date.now();

    await review.save();
    await review.populate('userId', 'fullName email');

    res.json({
      success: true,
      data: review,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
});

// Delete a review (authenticated users only)
router.delete('/:reviewId', auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns this review
    if (review.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    const productId = review.productId;
    await review.deleteOne();

    // Recalculate product rating
    const stats = await Review.aggregate([
      { $match: { productId } },
      { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } }
    ]);

    if (stats.length > 0) {
      const { avgRating, reviewCount } = stats[0];
      await Product.findByIdAndUpdate(productId, {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount
      });
    } else {
      // No reviews left
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        reviewCount: 0
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
});

// Get user's review for a specific product (authenticated)
router.get('/user/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const review = await Review.findOne({ productId, userId })
      .populate('userId', 'fullName email')
      .lean();

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error fetching user review:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching review',
      error: error.message
    });
  }
});

// Mark review as helpful (public)
router.post('/:reviewId/helpful', async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    ).populate('userId', 'fullName email');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
});

export default router;