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
    type: String,
    required: true
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
  gstPercentage: {
    type: Number,
    default: 18,
    min: 0,
    max: 100
  },
  shippingFee: {
    type: Number,
    default: 69,
    min: 0
  },
  freeShippingAbove: {
    type: Number,
    default: 999,
    min: 0
  },
  images: [{
    url: String,
    alt: String
  }],
  sizes: [{
    size: String,
    stock: Number,
    fit: String // e.g., "Regular Fit", "Slim Fit", "Oversized"
  }],
  colors: [String], // e.g., ["Red", "Blue", "Black"]
  fits: [String], // e.g., ["Regular Fit", "Slim Fit", "Oversized"]
  brand: {
    type: String,
    default: ''
  },
  isBestseller: {
    type: Boolean,
    default: false
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
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
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate slug from name before saving (only on creation, not on update)
productSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
  
  // Calculate total stock from sizes
  if (this.sizes && this.sizes.length > 0) {
    this.totalStock = this.sizes.reduce((total, size) => total + (size.stock || 0), 0);
  }
  
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Product', productSchema);