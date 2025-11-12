import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required'],
    validate: {
      validator: async function(productId) {
        const product = await mongoose.model('Product').findById(productId);
        return product !== null && product.isActive !== false;
      },
      message: 'Product not found or not active'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false, // We're handling timestamps manually
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure unique combination of user and product
wishlistSchema.index({ userId: 1, productId: 1 }, { 
  unique: true,
  name: 'user_product_unique'
});

// Compound index for efficient querying
wishlistSchema.index({ userId: 1, createdAt: -1 });

// Virtual for product details (useful when populating)
wishlistSchema.virtual('product', {
  ref: 'Product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true
});

// Virtual for user details (useful when populating)
wishlistSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Update the updatedAt field before saving
wishlistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get wishlist count for a user
wishlistSchema.statics.getWishlistCount = async function(userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID');
  }
  return await this.countDocuments({ userId });
};

// Static method to check if product is in user's wishlist
wishlistSchema.statics.isInWishlist = async function(userId, productId) {
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error('Invalid user ID or product ID');
  }
  return await this.findOne({ userId, productId });
};

// Static method to get user's wishlist with product details
wishlistSchema.statics.getUserWishlist = async function(userId, options = {}) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID');
  }

  const {
    limit = 50,
    skip = 0,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    populateProducts = true
  } = options;

  let query = this.find({ userId })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 });

  if (populateProducts) {
    query = query.populate({
      path: 'productId',
      select: 'name slug price discountPrice images isActive totalStock rating reviewCount sizes category',
      match: { isActive: true },
      populate: {
        path: 'category',
        select: 'name slug'
      }
    });
  }

  const wishlist = await query;
  
  // Filter out products that are no longer active or weren't populated
  return wishlist.filter(item => item.productId);
};

// Static method to add product to wishlist with validation
wishlistSchema.statics.addToWishlist = async function(userId, productId) {
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error('Invalid user ID or product ID');
  }

  // Check if product exists and is active
  const product = await mongoose.model('Product').findOne({ 
    _id: productId, 
    isActive: true 
  });
  
  if (!product) {
    throw new Error('Product not found or not active');
  }

  // Check if already in wishlist
  const existingItem = await this.findOne({ userId, productId });
  if (existingItem) {
    throw new Error('Product already in wishlist');
  }

  const wishlistItem = new this({
    userId,
    productId,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return await wishlistItem.save();
};

// Static method to remove product from wishlist
wishlistSchema.statics.removeFromWishlist = async function(userId, productId) {
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error('Invalid user ID or product ID');
  }

  const result = await this.findOneAndDelete({ userId, productId });
  
  if (!result) {
    throw new Error('Product not found in wishlist');
  }

  return result;
};

// Static method to clear user's entire wishlist
wishlistSchema.statics.clearWishlist = async function(userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID');
  }

  const result = await this.deleteMany({ userId });
  return result;
};

// Static method to get wishlist items by product IDs
wishlistSchema.statics.getWishlistItemsByProducts = async function(userId, productIds) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID');
  }

  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new Error('Product IDs array is required');
  }

  // Validate all product IDs
  const validProductIds = productIds.filter(id => mongoose.Types.ObjectId.isValid(id));
  
  return await this.find({ 
    userId, 
    productId: { $in: validProductIds } 
  });
};

// Instance method to get product details
wishlistSchema.methods.getProductDetails = async function() {
  await this.populate({
    path: 'productId',
    select: 'name slug price discountPrice images isActive totalStock rating reviewCount sizes category',
    populate: {
      path: 'category',
      select: 'name slug'
    }
  });
  return this.productId;
};

// Instance method to check if product is still available
wishlistSchema.methods.isProductAvailable = async function() {
  await this.populate('productId');
  return this.productId && this.productId.isActive && this.productId.totalStock > 0;
};

// Middleware to validate user exists before saving
wishlistSchema.pre('save', async function(next) {
  try {
    const user = await mongoose.model('User').findById(this.userId);
    if (!user) {
      throw new Error('User not found');
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Query helper to filter by active products only
wishlistSchema.query.activeProducts = function() {
  return this.populate({
    path: 'productId',
    match: { isActive: true }
  });
};

// Query helper to sort by creation date
wishlistSchema.query.sortByCreated = function(order = 'desc') {
  return this.sort({ createdAt: order === 'desc' ? -1 : 1 });
};

// Export the model
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;