import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: String,
  comment: String,
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one review per user per product
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

// Update product rating when review is saved
reviewSchema.post('save', async function() {
  const Review = this.constructor;
  const stats = await Review.aggregate([
    { $match: { productId: this.productId } },
    { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } }
  ]);

  if (stats.length > 0) {
    const { avgRating, reviewCount } = stats[0];
    await mongoose.model('Product').findByIdAndUpdate(this.productId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: reviewCount
    });
  }
});

export default mongoose.model('Review', reviewSchema);