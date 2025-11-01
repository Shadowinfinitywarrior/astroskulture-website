import { useEffect, useState } from 'react';
import { ShoppingCart, Heart, Star, Search, SlidersHorizontal, X } from 'lucide-react';
import { apiService } from '../lib/mongodb';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import type { Product, Category } from '../lib/types';

interface ShopPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export function ShopPage({ onNavigate }: ShopPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState('featured');
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, sortBy, searchQuery, priceRange]);

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
      const params: any = {};
      
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
        filteredProducts = filteredProducts.filter(product => {
          const price = product.discountPrice || product.price;
          return price >= priceRange[0] && price <= priceRange[1];
        });

        // Apply sorting on client side
        if (sortBy === 'price_low') {
          filteredProducts.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        } else if (sortBy === 'price_high') {
          filteredProducts.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        } else if (sortBy === 'rating') {
          filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortBy === 'newest') {
          filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (sortBy === 'featured') {
          // Featured products first, then by creation date
          filteredProducts.sort((a, b) => {
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

  const handleAddToCart = (product: Product) => {
    const defaultSize = product.sizes.find(size => size.stock > 0)?.size || 'M';
    const imageUrl = product.images[0]?.url || '';
    
    addToCart({
      productId: product._id,
      name: product.name,
      price: product.discountPrice || product.price,
      quantity: 1,
      size: defaultSize,
      image: imageUrl
    });

    // You could add a toast notification here
    console.log('Added to cart:', product.name);
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
    setSortBy('featured');
  };

  const getProductImage = (product: Product) => {
    return product.images[0]?.url || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500';
  };

  const getProductPrice = (product: Product) => {
    return product.discountPrice || product.price;
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

  const getAvailableSizes = (product: Product) => {
    return product.sizes.filter(size => size.stock > 0).map(size => size.size);
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
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        !selectedCategory
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
                        className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category.slug
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
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
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
                      <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow h-full flex flex-col">
                      <div className="relative overflow-hidden flex-shrink-0">
                        <img
                          src={getProductImage(product)}
                          alt={product.images[0]?.alt || product.name}
                          className="w-full h-48 md:h-72 object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                          onClick={() => handleProductClick(product)}
                        />
                        
                        {/* Top Left Badge - Priority: Discount > Featured > Stock */}
                        <div className="absolute top-2 left-2">
                          {hasDiscount(product) ? (
                            <div className="flex items-center gap-1">
                              <div className="bg-red-600 text-white px-2.5 py-1 rounded-full text-xs sm:text-sm font-bold">
                                {getDiscountPercentage(product)}%
                              </div>
                              <div className="bg-yellow-400 text-gray-900 px-2.5 py-1 rounded-full text-xs sm:text-sm font-bold">
                                Featured
                              </div>
                            </div>
                          ) : product.isFeatured ? (
                            <div className="bg-yellow-400 text-gray-900 px-2.5 py-1 rounded-full text-xs sm:text-sm font-bold">
                              Featured
                            </div>
                          ) : stockStatus === 'out-of-stock' ? (
                            <div className="bg-gray-600 text-white px-2.5 py-1 rounded text-xs font-semibold">
                              Out of Stock
                            </div>
                          ) : stockStatus === 'low-stock' ? (
                            <div className="bg-orange-500 text-white px-2.5 py-1 rounded text-xs font-semibold">
                              Low Stock
                            </div>
                          ) : null}
                        </div>
                        
                        {/* Top Right - Wishlist Button */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWishlistToggle(product);
                          }}
                          disabled={isWishlistLoading}
                          className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-colors ${
                            isInWishlistState
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-600'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
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
                        <h3 
                          onClick={() => handleProductClick(product)}
                          className="font-semibold text-sm md:text-base text-gray-900 mb-2 cursor-pointer hover:text-red-600 transition-colors line-clamp-2"
                        >
                          {product.name}
                        </h3>
                        <div className="flex items-center space-x-1 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 md:w-4 md:h-4 ${
                                  i < Math.floor(product.rating || 0)
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs md:text-sm font-medium text-gray-700">{(product.rating || 0).toFixed(1)}</span>
                          <span className="text-xs md:text-sm text-gray-500">({product.reviewCount || 0})</span>
                        </div>
                        <div className="flex-grow mb-3">
                          {hasDiscount(product) && (
                            <div className="flex items-center gap-1 mb-1">
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded font-semibold">
                                ✓ Offer Price
                              </span>
                            </div>
                          )}
                          <div className="flex items-baseline space-x-2">
                            {hasDiscount(product) ? (
                              <div className="flex items-center space-x-2">
                                <span className="text-base md:text-lg font-bold text-red-600">
                                  ₹{formatPrice(product.discountPrice!)}
                                </span>
                                <span className="text-xs md:text-sm text-gray-500 line-through">
                                  ₹{formatPrice(product.price)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-base md:text-lg font-bold text-gray-900">₹{formatPrice(getDisplayPrice(product))}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {getAvailableSizes(product).slice(0, 3).map(size => (
                            <span key={size} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                              {size}
                            </span>
                          ))}
                        </div>
                        {product.totalStock > 0 && product.totalStock < 10 && (
                          <p className="text-orange-600 text-xs mb-2">Only {product.totalStock} left</p>
                        )}
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.totalStock === 0}
                          className="w-full p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                          title={product.totalStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        >
                          <ShoppingCart className="w-4 h-4 inline mr-1" />
                          Add to Cart
                        </button>
                      </div>
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