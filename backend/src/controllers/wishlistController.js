import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

export const getWishlist = async (req, res) => {
  try {
    console.log('💖 [SERVER] Fetching wishlist for user:', req.user.id);
    
    const wishlist = await Wishlist.find({ userId: req.user.id })
      .populate({
        path: 'productId',
        select: 'name slug price discountPrice images isActive totalStock rating reviewCount sizes categoryId',
        match: { isActive: true },
        populate: {
          path: 'categoryId',
          select: 'name slug'
        }
      })
      .sort({ createdAt: -1 });

    // Filter out products that are no longer active or weren't populated
    const validWishlist = wishlist.filter(item => item.productId);

    console.log('💖 [SERVER] Wishlist found:', validWishlist.length, 'items');

    res.json({
      success: true,
      data: validWishlist,
      count: validWishlist.length,
      message: validWishlist.length === 0 ? 'Your wishlist is empty' : `Found ${validWishlist.length} items in wishlist`
    });
  } catch (error) {
    console.error('❌ Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      error: error.message
    });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    console.log('💖 [SERVER] Adding to wishlist:', { userId, productId });

    // Validate productId
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    // Check if product exists and is active
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not available'
      });
    }

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({ userId, productId });
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    const wishlistItem = new Wishlist({ 
      userId, 
      productId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await wishlistItem.save();

    // Populate the product details for response
    await wishlistItem.populate({
      path: 'productId',
      select: 'name slug price discountPrice images rating sizes categoryId',
      populate: {
        path: 'categoryId',
        select: 'name slug'
      }
    });

    console.log('💖 [SERVER] Product added to wishlist successfully:', wishlistItem._id);

    res.status(201).json({
      success: true,
      message: 'Product added to wishlist successfully',
      data: wishlistItem
    });
  } catch (error) {
    console.error('❌ Add to wishlist error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to add to wishlist',
      error: error.message
    });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    console.log('💖 [SERVER] Removing from wishlist:', { userId, productId });

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    const result = await Wishlist.findOneAndDelete({ userId, productId });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist'
      });
    }

    console.log('💖 [SERVER] Product removed from wishlist successfully');

    res.json({
      success: true,
      message: 'Product removed from wishlist successfully',
      removedItem: result._id
    });
  } catch (error) {
    console.error('❌ Remove from wishlist error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist',
      error: error.message
    });
  }
};

export const checkWishlistStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    console.log('💖 [SERVER] Checking wishlist status:', { userId, productId });

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    const wishlistItem = await Wishlist.findOne({ userId, productId });

    res.json({
      success: true,
      data: {
        inWishlist: !!wishlistItem,
        wishlistItem: wishlistItem || null
      }
    });
  } catch (error) {
    console.error('❌ Check wishlist status error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist status',
      error: error.message
    });
  }
};

// Additional method to get wishlist count
export const getWishlistCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Wishlist.countDocuments({ userId });
    
    console.log('💖 [SERVER] Wishlist count for user:', userId, '=', count);
    
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('❌ Get wishlist count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wishlist count',
      error: error.message
    });
  }
};

// Bulk operations
export const clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await Wishlist.deleteMany({ userId });
    
    console.log('💖 [SERVER] Cleared wishlist for user:', userId, 'removed:', result.deletedCount, 'items');
    
    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} items from wishlist`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    console.error('❌ Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist',
      error: error.message
    });
  }
};

// Add multiple products to wishlist
export const addMultipleToWishlist = async (req, res) => {
  try {
    const { productIds } = req.body;
    const userId = req.user.id;

    console.log('💖 [SERVER] Adding multiple products to wishlist:', { userId, productIds });

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs array is required'
      });
    }

    // Validate all product IDs
    const validProductIds = productIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validProductIds.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some product IDs are invalid'
      });
    }

    // Check which products already exist in wishlist
    const existingItems = await Wishlist.find({ 
      userId, 
      productId: { $in: validProductIds } 
    });
    
    const existingProductIds = existingItems.map(item => item.productId.toString());
    const newProductIds = validProductIds.filter(id => !existingProductIds.includes(id));

    if (newProductIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All products are already in wishlist'
      });
    }

    // Create new wishlist items
    const wishlistItems = newProductIds.map(productId => ({
      userId,
      productId,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const result = await Wishlist.insertMany(wishlistItems);

    console.log('💖 [SERVER] Added multiple products to wishlist:', result.length, 'items');

    res.status(201).json({
      success: true,
      message: `Added ${result.length} products to wishlist`,
      data: result,
      addedCount: result.length,
      alreadyExistsCount: existingItems.length
    });
  } catch (error) {
    console.error('❌ Add multiple to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add products to wishlist',
      error: error.message
    });
  }
};