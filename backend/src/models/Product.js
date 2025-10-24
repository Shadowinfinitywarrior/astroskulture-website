import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0
  },
  images: [{
    url: String,
    alt: String
  }],
  sizes: [{
    size: String,
    stock: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  totalStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
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

// Calculate total stock from sizes
productSchema.pre('save', function(next) {
  this.totalStock = this.sizes.reduce((total, size) => total + size.stock, 0);
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
productSchema.index({ categoryId: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });

export default mongoose.model('Product', productSchema);