import { useEffect, useState } from 'react';
import { ShoppingCart, Heart, Star, Search, SlidersHorizontal } from 'lucide-react';
import { apiService } from '../lib/mongodb';
import { useCart } from '../contexts/CartContext';
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
  const { addToCart } = useCart();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm py-8 mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Shop All Products</h1>
          <p className="text-gray-600">Discover our complete collection</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full md:w-64 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
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
                      <span>₹{priceRange[1]}</span>
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
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{products.length}</span> products
                {selectedCategory && (
                  <> in <span className="font-semibold">{categories.find(c => c.slug === selectedCategory)?.name}</span></>
                )}
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
              >
                <option value="featured">Featured</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="relative overflow-hidden">
                      <img
                        src={getProductImage(product)}
                        alt={product.images[0]?.alt || product.name}
                        className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                        onClick={() => handleProductClick(product)}
                      />
                      {hasDiscount(product) && (
                        <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {getDiscountPercentage(product)}% OFF
                        </div>
                      )}
                      {product.isFeatured && (
                        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Featured
                        </div>
                      )}
                      <button className="absolute top-16 right-4 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                        <Heart className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3
                        onClick={() => handleProductClick(product)}
                        className="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-red-600 transition-colors line-clamp-2"
                      >
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center space-x-1 mb-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium">{(product.rating || 0).toFixed(1)}</span>
                        <span className="text-sm text-gray-500">({product.reviewCount || 0})</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          {hasDiscount(product) ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-red-600">
                                ₹{getDisplayPrice(product)}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                ₹{product.price}
                              </span>
                            </div>
                          ) : (
                            <span className="text-lg font-bold text-gray-900">₹{getDisplayPrice(product)}</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.totalStock === 0}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {getAvailableSizes(product).map(size => (
                          <span key={size} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {size}
                          </span>
                        ))}
                      </div>
                      {product.totalStock === 0 && (
                        <p className="text-red-600 text-sm">Out of Stock</p>
                      )}
                      {product.totalStock > 0 && product.totalStock < 10 && (
                        <p className="text-orange-600 text-sm">Only {product.totalStock} left in stock</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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