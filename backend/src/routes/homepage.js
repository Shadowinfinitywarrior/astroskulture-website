import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Banner from '../models/Banner.js';

const router = express.Router();

// In-memory cache for homepage data
let cachedData = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

export const invalidateHomepageCache = () => {
  cachedData = null;
  cacheExpiry = 0;
};

// Projection fields for lean homepage product cards
const HOMEPAGE_PRODUCT_PROJECTION = {
  _id: 1,
  name: 1,
  slug: 1,
  price: 1,
  discountPrice: 1,
  images: 1,
  sizes: 1,
  totalStock: 1,
  isBestseller: 1,
  rating: 1,
  reviewCount: 1,
  category: 1
};

router.get('/', async (req, res) => {
  try {
    const now = Date.now();
    if (cachedData && now < cacheExpiry) {
      res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
      return res.json({
        success: true,
        source: 'cache',
        ...cachedData
      });
    }

    // Parallel fetch top-level homepage items
    const [banners, categories, featuredProducts] = await Promise.all([
      Banner.find({ isActive: true })
        .sort({ displayOrder: 1 })
        .select('displayText discountPercentage backgroundColor textColor displayOrder')
        .lean(),
      Category.find({ isActive: true })
        .sort({ displayOrder: 1, name: 1 })
        .select('name slug imageUrl description displayOrder')
        .lean(),
      Product.find({ isActive: true, isFeatured: true })
        .select(HOMEPAGE_PRODUCT_PROJECTION)
        .populate({
          path: 'category',
          select: 'name slug',
          match: { isActive: true }
        })
        .sort({ createdAt: -1 })
        .limit(8)
        .lean()
    ]);

    // Select first 4 categories for homepage shelf previews
    const topCategories = categories.slice(0, 4);

    // Parallel fetch product previews for each category
    const categoryProducts = {};
    await Promise.all(
      topCategories.map(async (cat) => {
        const prods = await Product.find({
          isActive: true,
          category: cat._id
        })
          .select(HOMEPAGE_PRODUCT_PROJECTION)
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();

        categoryProducts[cat.slug] = prods;
      })
    );

    const payload = {
      banners,
      categories,
      featuredProducts,
      categoryProducts
    };

    cachedData = payload;
    cacheExpiry = now + CACHE_TTL_MS;

    res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
    return res.json({
      success: true,
      source: 'database',
      ...payload
    });
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve homepage data',
      error: error.message
    });
  }
});

export default router;
