import { useEffect, useState } from 'react';
import { Heart, Search, SlidersHorizontal, X, ShoppingCart, Check } from 'lucide-react';
import { apiService } from '../lib/mongodb';

import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import type { Product, Category, ProductSize } from '../lib/types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { trackEcommerce } from '../lib/analytics';
import { optimizeImageUrl } from '../utils/imageUtils';
import { updatePageSeo } from '../utils/seoUtils';
import { ProductCardSkeleton } from './ProductCard';
import { QuickSizePicker } from '../components/QuickSizePicker';

interface ShopPageProps {
  onNavigate: (page: string, params?: any) => void;
  initialCategory?: string;
}

export function ShopPage({ onNavigate, initialCategory }: ShopPageProps) {
  const [products, setProducts] = useState < Product[] > ([]);
  const [categories, setCategories] = useState < Category[] > ([]);
  const [loading, setLoading] = useState(true);

  // Initialize state from URL params
  const getSearchParams = () => new URLSearchParams(window.location.search);

  const [searchQuery, setSearchQuery] = useState(() => getSearchParams().get('q') || getSearchParams().get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState < string | null > (() => {
    const params = getSearchParams();
    return initialCategory || params.get('category') || null;
  });
  const [priceRange, setPriceRange] = useState < [number, number] > (() => {
    const params = getSearchParams();
    const min = Number(params.get('minPrice')) || 0;
    const max = Number(params.get('maxPrice')) || 10000;
    return [min, max];
  });
  const [selectedSizes, setSelectedSizes] = useState < string[] > (() => {
    const params = getSearchParams();
    const sizes = params.get('sizes');
    return sizes ? sizes.split(',') : [];
  });

  const [minRating, setMinRating] = useState(() => {
    const params = getSearchParams();
    return Number(params.get('minRating')) || 0;
  });
  const [sortBy, setSortBy] = useState(() => getSearchParams().get('sortBy') || 'featured');
  const [wishlistLoading, setWishlistLoading] = useState < string | null > (null);
  const [showFilters, setShowFilters] = useState(false);

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [sizePickerProductId, setSizePickerProductId] = useState<string | null>(null);

  // Sync search query when query parameter changes
  useEffect(() => {
    const params = getSearchParams();
    const q = params.get('q') || params.get('search');
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q);
    }
  }, [window.location.search]);

  const handleSelectSizeShop = (product: Product, size: string) => {
    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      gstPercentage: product.gstPercentage ?? 0,
      gstApplicable: product.gstApplicable ?? false,
      shippingFee: product.shippingFee ?? 0,
      freeShippingAbove: product.freeShippingAbove ?? 0,
      size: size,
      image: product.images[0]?.url || '',
    });

    setAddedProductId(product._id);
    setSizePickerProductId(null);
    setTimeout(() => {
      setAddedProductId((current) => (current === product._id ? null : current));
    }, 2000);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.totalStock === 0) return;
    setSizePickerProductId(prev => prev === product._id ? null : product._id);
  };

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.totalStock === 0) return;

    const defaultSize = product.sizes?.find((s: any) => s.stock > 0)?.size || 'M';
    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      gstPercentage: product.gstPercentage ?? 0,
      gstApplicable: product.gstApplicable ?? false,
      shippingFee: product.shippingFee ?? 0,
      freeShippingAbove: product.freeShippingAbove ?? 0,
      size: defaultSize,
      image: product.images[0]?.url || '',
    });

    onNavigate('checkout');
  };

  useEffect(() => {
    // Update selected category if initialCategory changes
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const catName = selectedCategory && selectedCategory !== 'all' ? selectedCategory : 'All Streetwear & Oversized T-Shirts';
    updatePageSeo({
      title: `${catName} – 240 GSM Heavyweight Oversized T-Shirts | ASTROS KULTURE`,
      description: `Explore ${catName} at ASTROS KULTURE. Heavyweight 240 GSM combed cotton graphic tees, anime oversized streetwear, and limited drops. Free shipping across India.`,
      canonicalUrl: selectedCategory && selectedCategory !== 'all' 
        ? `https://astroskulture.in/shop?category=${encodeURIComponent(selectedCategory)}` 
        : 'https://astroskulture.in/shop',
      ogType: 'website',
      structuredData: [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": catName,
          "description": `Shop ${catName} at ASTROS KULTURE`,
          "url": window.location.href,
          "isPartOf": {
            "@type": "WebSite",
            "name": "ASTROS KULTURE",
            "url": "https://astroskulture.in"
          }
        },
        ...(products.length > 0 ? [{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": `${catName} 240 GSM Streetwear Collection`,
          "numberOfItems": products.length,
          "itemListElement": products.slice(0, 12).map((prod, idx) => ({
            "@type": "ListItem",
            "position": idx + 1,
            "url": `https://astroskulture.in/product/${prod.slug}`,
            "name": prod.name
          }))
        }] : [])
      ]
    });
  }, [selectedCategory, products.length]);

  useEffect(() => {
    loadProducts();
    if (searchQuery && searchQuery.trim().length > 1) {
      trackEcommerce('search', [], { searchTerm: searchQuery.trim() });
    }
  }, [selectedCategory, sortBy, searchQuery, priceRange, selectedSizes, minRating]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (selectedCategory && selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    } else {
      params.delete('category');
    }

    if (searchQuery) params.set('search', searchQuery);
    else params.delete('search');

    if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString());
    else params.delete('minPrice');

    if (priceRange[1] < 10000) params.set('maxPrice', priceRange[1].toString());
    else params.delete('maxPrice');

    if (selectedSizes.length > 0) params.set('sizes', selectedSizes.join(','));
    else params.delete('sizes');



    if (minRating > 0) params.set('minRating', minRating.toString());
    else params.delete('minRating');

    if (sortBy !== 'featured') params.set('sortBy', sortBy);
    else params.delete('sortBy');

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(window.history.state, '', newUrl);

  }, [selectedCategory, searchQuery, priceRange, selectedSizes, minRating, sortBy]);

  const loadCategories = async () => {
    try {
      const data = await apiService.getCategories();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 0 };

      if (selectedCategory && selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (sortBy === 'featured') {
        params.featured = true;
      }

      const data = await apiService.getProducts(params);

      if (data.success) {
        let filteredProducts = data.data;

        // Apply price range filter on client side
        filteredProducts = filteredProducts.filter((product: Product) => {
          const price = product.discountPrice || product.price;
          return price >= priceRange[0] && price <= priceRange[1];
        });

        // Apply rating filter
        if (minRating > 0) {
          filteredProducts = filteredProducts.filter((product: Product) =>
            (product.rating || 0) >= minRating
          );
        }

        // Apply size filter
        if (selectedSizes.length > 0) {
          filteredProducts = filteredProducts.filter((product: Product) =>
            product.sizes && product.sizes.some((s: ProductSize) => selectedSizes.includes(s.size))
          );
        }



        // Defensive category filter - ensure products match selected category
        if (selectedCategory && selectedCategory !== 'all') {
          filteredProducts = filteredProducts.filter((product: Product) =>
            product.category && (typeof product.category === 'object' ? product.category.slug === selectedCategory : product.category === selectedCategory)
          );
        }

        // Apply sorting on client side
        if (sortBy === 'price_low') {
          filteredProducts.sort((a: Product, b: Product) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        } else if (sortBy === 'price_high') {
          filteredProducts.sort((a: Product, b: Product) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        } else if (sortBy === 'rating') {
          filteredProducts.sort((a: Product, b: Product) => (b.rating || 0) - (a.rating || 0));
        } else if (sortBy === 'newest') {
          filteredProducts.sort((a: Product, b: Product) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (sortBy === 'featured') {
          // Featured products first, then by creation date
          filteredProducts.sort((a: Product, b: Product) => {
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
        }

        setProducts(filteredProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistToggle = async (product: Product) => {
    if (!user) {
      onNavigate('login');
      return;
    }

    try {
      setWishlistLoading(product._id);
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setWishlistLoading(null);
    }
  };

  const handleProductClick = (product: Product) => {
    console.log('🛍️ [DEBUG] Navigating to product:', {
      id: product._id,
      slug: product.slug,
      name: product.name
    });
    onNavigate('product', { slug: product.slug });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    setPriceRange([0, 10000]);
    setSelectedSizes([]);
    setMinRating(0);
    setSortBy('featured');
  };

  const getProductImage = (product: Product) => {
    const raw = product.images[0]?.url || '/hero-banner-mobile.webp';
    return optimizeImageUrl(raw, { width: 400, quality: 'auto:good' });
  };

  const getDisplayPrice = (product: Product) => {
    return product.discountPrice || product.price;
  };

  const hasDiscount = (product: Product) => {
    return product.discountPrice && product.discountPrice < product.price;
  };

  const getDiscountPercentage = (product: Product) => {
    if (!product.discountPrice || product.discountPrice >= product.price) return 0;
    return Math.round((1 - product.discountPrice / product.price) * 100);
  };

  // Format price with Indian numbering system
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  const getStockStatus = (product: Product) => {
    if (product.totalStock === 0) return 'out-of-stock';
    if (product.totalStock < 10) return 'low-stock';
    return 'in-stock';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Mobile Filter Toggle Button - Small at Top Left */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center justify-center gap-2 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm mb-4"
          title={showFilters ? 'Hide Filters' : 'Show Filters'}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {showFilters ? 'Hide' : 'Filters'}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Filters Sidebar - Hidden on Mobile, Shown on Desktop */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 space-y-6`}>
            {/* Mobile Header with Close Button */}
            {showFilters && (
              <div className="md:hidden flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg flex items-center">
                  <SlidersHorizontal className="w-5 h-5 mr-2" />
                  Filters
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-4 flex items-center hidden md:flex">
                <SlidersHorizontal className="w-5 h-5 mr-2" />
                Filters
              </h3>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Search
                  </label>
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                    />
                  </form>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Category
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${!selectedCategory
                        ? 'bg-red-50 text-red-600 font-medium'
                        : 'hover:bg-gray-50'
                        }`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category._id}
                        onClick={() => setSelectedCategory(category.slug)}
                        className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === category.slug
                          ? 'bg-red-50 text-red-600 font-medium'
                          : 'hover:bg-gray-50'
                          }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Price Range
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className="w-full accent-red-600"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>₹0</span>
                      <span>₹{formatPrice(priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                {/* Size Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Size
                  </label>
                  <div className="space-y-2">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                      <label key={size} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSizes.includes(size)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSizes([...selectedSizes, size]);
                            } else {
                              setSelectedSizes(selectedSizes.filter(s => s !== size));
                            }
                          }}
                          className="w-4 h-4 accent-red-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>



                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Minimum Rating
                  </label>
                  <div className="space-y-2">
                    {[0, 2, 3, 4, 5].map((rating) => (
                      <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="rating"
                          checked={minRating === rating}
                          onChange={() => setMinRating(rating)}
                          className="w-4 h-4 accent-red-600"
                        />
                        <span className="text-sm text-gray-700">
                          {rating === 0 ? 'All' : `${rating}★ & up`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear Filters Button */}
                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <>
                {/* Mobile & Desktop Grid - 2 columns mobile, 3 columns desktop */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product);
                    const isInWishlistState = isInWishlist(product._id);
                    const isWishlistLoading = wishlistLoading === product._id;

                    return (
                      <div key={product._id} className="bg-white rounded-lg overflow-hidden group hover:shadow-lg transition-all duration-300 h-full flex flex-col border border-gray-200 relative">
                        <div className="relative overflow-hidden flex-shrink-0 w-full aspect-square bg-gray-100">
                          <a
                            href={`/product/${product.slug}`}
                            onClick={(e) => {
                              e.preventDefault();
                              handleProductClick(product);
                            }}
                            className="block w-full h-full"
                            aria-label={product.name}
                          >
                            <img
                              src={getProductImage(product)}
                              alt={product.images[0]?.alt || `${product.name} - 240 GSM Heavyweight Oversized Cotton T-Shirt`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                              loading="lazy"
                              decoding="async"
                              width={400}
                              height={400}
                            />
                          </a>

                          {/* Top Left - Bestseller Badge */}
                          {product.isBestseller && (
                            <div className="absolute top-2 left-2 pointer-events-none">
                              <div className="bg-gray-800 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide">
                                BESTSELLER
                              </div>
                            </div>
                          )}

                          {/* Top Right - Wishlist Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWishlistToggle(product);
                            }}
                            disabled={isWishlistLoading}
                            className={`absolute top-2 right-2 p-2 rounded-full shadow-lg transition-all ${isInWishlistState
                              ? 'bg-white text-red-600'
                              : 'bg-white text-gray-400 hover:text-red-600'
                              } disabled:opacity-50 disabled:cursor-not-allowed z-10`}
                            title={isInWishlistState ? 'Remove from Wishlist' : 'Add to Wishlist'}
                          >
                            {isWishlistLoading ? (
                              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isInWishlistState ? 'fill-current' : ''}`} />
                            )}
                          </button>
                        </div>
                        <div className="p-3 md:p-4 flex flex-col flex-grow">
                          {/* Brand Name */}
                          {product.brand && (
                            <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wide mb-1">
                              {product.brand}
                            </p>
                          )}

                          {/* Product Name */}
                          <h3 className="font-medium text-sm md:text-base text-gray-900 mb-2 hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                            <a
                              href={`/product/${product.slug}`}
                              onClick={(e) => {
                                e.preventDefault();
                                handleProductClick(product);
                              }}
                              className="hover:text-red-600"
                            >
                              {product.name}
                            </a>
                          </h3>

                          {/* Rating */}
                          <div className="flex items-center gap-1 mb-3">
                            <div className="flex items-center bg-green-600 text-white px-2 py-0.5 rounded text-xs font-semibold">
                              <span>{product.rating && product.rating % 1 === 0 ? Math.round(product.rating) : (product.rating || 0).toFixed(1)}★</span>
                            </div>
                            <span className="text-xs text-gray-500">| {product.reviewCount || 0}</span>
                          </div>

                          {/* Price Section */}
                          <div className="flex-grow mb-3">
                            <div className="flex items-baseline gap-2 flex-wrap mb-1">
                              <span className="text-lg md:text-xl font-bold text-gray-900">
                                ₹{formatPrice(getDisplayPrice(product))}
                              </span>
                              {hasDiscount(product) && (
                                <>
                                  <span className="text-sm text-gray-400 line-through">
                                    ₹{formatPrice(product.price)}
                                  </span>
                                  <span className="text-sm font-semibold text-green-600">
                                    {getDiscountPercentage(product)}% off
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Offer Price Label */}
                            {hasDiscount(product) && (
                              <div className="flex items-center gap-1 mt-1">
                                <div className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                                  <span>✓</span>
                                  <span>Offer Price: ₹{formatPrice(product.discountPrice!)}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Stock Warning */}
                          {product.totalStock > 0 && product.totalStock < 10 && (
                            <p className="text-orange-600 text-xs mb-2 font-medium">Only {product.totalStock} left</p>
                          )}

                          {/* Out of Stock */}
                          {stockStatus === 'out-of-stock' && (
                            <p className="text-red-600 text-xs mb-2 font-semibold">Out of Stock</p>
                          )}

                          {/* Action Buttons: Add to Cart & Buy Now */}
                          <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col sm:flex-row gap-2">
                            {product.totalStock === 0 ? (
                              <button
                                disabled
                                className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-gray-100 text-gray-400 cursor-not-allowed"
                              >
                                Out of Stock
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={(e) => handleAddToCart(e, product)}
                                  className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center transition-all border ${
                                    addedProductId === product._id
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50 active:scale-95'
                                  }`}
                                  aria-label={`Add ${product.name} to cart`}
                                >
                                  {addedProductId === product._id ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                                      Added
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                                      Add to Cart
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={(e) => handleBuyNow(e, product)}
                                  className="flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 active:scale-95 flex items-center justify-center transition-all shadow-sm"
                                  aria-label={`Buy ${product.name} now`}
                                >
                                  Buy Now
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Quick Size Selector Popover */}
                        {sizePickerProductId === product._id && (
                          <QuickSizePicker
                            product={product}
                            onSelectSize={(size) => handleSelectSizeShop(product, size)}
                            onClose={() => setSizePickerProductId(null)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {!loading && products.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg mb-4">No products found matching your criteria.</p>
                <button
                  onClick={clearFilters}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}