import Product from '../models/Product.js';
import Category from '../models/Category.js';

export const getAllProducts = async (req, res) => {
  try {
    const { category, featured, search, page = 1, limit } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    let limitNumber = 12;

    if (limit !== undefined) {
      if (limit === 'all' || limit === '0') {
        limitNumber = 0;
      } else {
        const parsedLimit = parseInt(limit, 10);
        limitNumber = Number.isNaN(parsedLimit) ? 12 : parsedLimit;
      }
    }

    let query = { isActive: true };
    
    // Filter by category slug
    if (category && category !== 'all') {
      const categoryDoc = await Category.findOne({ slug: category, isActive: true });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        // If category not found, return empty results
        return res.json({
          success: true,
          data: [],
          pagination: {
            page: pageNumber,
            limit: 0,
            total: 0,
            pages: 0
          }
        });
      }
    }
    
    // Filter by featured
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const shouldPaginate = limitNumber > 0;

    let productsQuery = Product.find(query)
      .populate({
        path: 'category',
        select: 'name slug imageUrl description',
        match: { isActive: true }
      })
      .sort({ createdAt: -1 });

    if (shouldPaginate) {
      productsQuery = productsQuery
        .limit(limitNumber)
        .skip((pageNumber - 1) * limitNumber);
    }

    const products = await productsQuery.lean();

    // Clean up products with null category
    const cleanedProducts = products.map(product => ({
      ...product,
      category: product.category || { 
        name: 'Uncategorized', 
        slug: 'uncategorized',
        imageUrl: null,
        description: null
      }
    }));

    const total = await Product.countDocuments(query);
    const totalPages = shouldPaginate ? Math.ceil(total / limitNumber) : 1;
    const paginationLimit = shouldPaginate ? limitNumber : total;

    res.json({
      success: true,
      data: cleanedProducts,
      pagination: {
        page: pageNumber,
        limit: paginationLimit,
        total,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch products', 
      error: error.message 
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({
        path: 'category',
        select: 'name slug imageUrl description',
        match: { isActive: true }
      })
      .lean();
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    // Clean up category if null
    const cleanedProduct = {
      ...product,
      category: product.category || { 
        name: 'Uncategorized', 
        slug: 'uncategorized',
        imageUrl: null,
        description: null
      }
    };

    res.json({
      success: true,
      data: cleanedProduct
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch product', 
      error: error.message 
    });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    console.log('🔍 [DEBUG] Searching for product with slug:', req.params.slug);
    
    const product = await Product.findOne({ 
      slug: req.params.slug,
      isActive: true 
    })
      .populate({
        path: 'category',
        select: 'name slug imageUrl description',
        match: { isActive: true }
      })
      .lean();

    console.log('📦 [DEBUG] Product found:', product ? product.name : 'None');
    
    if (!product) {
      console.log('❌ [DEBUG] Product not found with slug:', req.params.slug);
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    // Clean up category if null
    const cleanedProduct = {
      ...product,
      category: product.category || { 
        name: 'Uncategorized', 
        slug: 'uncategorized',
        imageUrl: null,
        description: null
      }
    };

    console.log('✅ [DEBUG] Returning product:', cleanedProduct.name);
    res.json({
      success: true,
      data: cleanedProduct
    });
  } catch (error) {
    console.error('❌ Get product by slug error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch product', 
      error: error.message 
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    // Calculate totalStock from sizes if provided
    if (req.body.sizes && Array.isArray(req.body.sizes)) {
      req.body.totalStock = req.body.sizes.reduce((total, size) => total + (size.stock || 0), 0);
    }

    const product = new Product(req.body);
    await product.save();
    
    const populatedProduct = await Product.findById(product._id)
      .populate({
        path: 'category',
        select: 'name slug imageUrl description'
      })
      .lean();

    res.status(201).json({
      success: true,
      data: populatedProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Failed to create product', 
      error: error.message 
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    // Calculate totalStock from sizes if provided
    if (req.body.sizes && Array.isArray(req.body.sizes)) {
      req.body.totalStock = req.body.sizes.reduce((total, size) => total + (size.stock || 0), 0);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate({
      path: 'category',
      select: 'name slug imageUrl description'
    }).lean();
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Failed to update product', 
      error: error.message 
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete product', 
      error: error.message 
    });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ 
      isFeatured: true, 
      isActive: true 
    })
      .populate({
        path: 'category',
        select: 'name slug imageUrl description',
        match: { isActive: true }
      })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    // Clean up products with null category
    const cleanedProducts = products.map(product => ({
      ...product,
      category: product.category || { 
        name: 'Uncategorized', 
        slug: 'uncategorized',
        imageUrl: null,
        description: null
      }
    }));

    res.json({
      success: true,
      data: cleanedProducts
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch featured products', 
      error: error.message 
    });
  }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const category = await Category.findOne({ slug, isActive: true });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const products = await Product.find({ 
      category: category._id,
      isActive: true 
    })
      .populate({
        path: 'category',
        select: 'name slug imageUrl description'
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Product.countDocuments({ 
      category: category._id,
      isActive: true 
    });

    res.json({
      success: true,
      data: products,
      category: {
        _id: category._id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.imageUrl
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products by category',
      error: error.message
    });
  }
};

// Get all categories with product counts
export const getCategoriesWithCounts = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({
          category: category._id,
          isActive: true
        });
        return {
          ...category,
          productCount
        };
      })
    );

    res.json({
      success: true,
      data: categoriesWithCounts
    });
  } catch (error) {
    console.error('Get categories with counts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories with counts',
      error: error.message
    });
  }
};

// Debug endpoint to see all products and slugs
export const getAllProductsDebug = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .select('name slug _id category totalStock isActive')
      .populate('category', 'name slug')
      .sort({ name: 1 })
      .lean();
    
    console.log('🔍 [DEBUG] All active products:', products.length);
    
    res.json({
      success: true,
      data: products,
      count: products.length,
      message: `Found ${products.length} active products in database`
    });
  } catch (error) {
    console.error('Get products debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Emergency fallback endpoint without population
export const getAllProductsSimple = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .select('-category')
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get products simple error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch products', 
      error: error.message 
    });
  }
};