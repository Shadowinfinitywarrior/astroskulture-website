import { useEffect, useState } from 'react';
import { ShoppingCart, Heart, Star, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { apiService } from '../lib/mongodb';

interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: Array<{ url: string; alt: string }>;
  sizes: Array<{ size: string; stock: number }>;
  totalStock: number;
  isFeatured: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  categoryId?: {
    _id: string;
    name: string;
    slug: string;
  };
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
}

interface Banner {
  _id: string;
  discountPercentage: number;
  textColor?: string;
  backgroundColor?: string;
  displayOrder: number;
  isActive: boolean;
}

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryScrollPos, setCategoryScrollPos] = useState(0);
  const [bannerAnimatePos, setBannerAnimatePos] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    loadData();
  }, []);

  // Animate banner text movement
  useEffect(() => {
    const interval = setInterval(() => {
      setBannerAnimatePos((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setError('');
      
      // Load featured products
      const productsResponse = await apiService.getProducts({ featured: 'true' });
      
      if (productsResponse.success) {
        // The products are in productsResponse.data
        setFeaturedProducts(productsResponse.data || []);
      } else {
        throw new Error(productsResponse.message || 'Failed to load products');
      }

      // Load categories
      const categoriesResponse = await apiService.getCategories();
      
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data || []);
      } else {
        throw new Error(categoriesResponse.message || 'Failed to load categories');
      }

      // Load banners
      try {
        const bannersResponse = await apiService.getBanners();
        if (bannersResponse.success) {
          const activeBanners = (bannersResponse.data || []).filter((b: Banner) => b.isActive);
          setBanners(activeBanners.sort((a, b) => a.displayOrder - b.displayOrder));
        }
      } catch (bannerError) {
        console.warn('Failed to load banners:', bannerError);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    const defaultSize = product.sizes.find(size => size.stock > 0)?.size || 'M';
    const mainImage = product.images[0]?.url || '';
    
    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: mainImage,
      size: defaultSize,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Data</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-auto md:h-[500px] bg-gradient-to-r from-red-600 to-red-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200"
            alt="Hero"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 min-h-[500px] md:h-full flex flex-col justify-center py-8 md:py-0">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-2 mb-3 md:mb-4">
              <Star className="w-6 md:w-8 h-6 md:h-8 fill-white" />
              <span className="text-lg md:text-2xl font-bold">ASTROS KULTURE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              Premium Streetwear
            </h1>
            <p className="text-sm md:text-lg mb-6 md:mb-8 text-gray-100 leading-relaxed">
              Discover our exclusive collection of oversized tees, shirts, and cotton pants.
              Quality that speaks for itself.
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => onNavigate('shop')}
                className="bg-white text-red-600 px-6 md:px-8 py-2 md:py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center justify-center sm:justify-start space-x-2 text-sm md:text-base"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 md:w-5 h-4 md:h-5" />
              </button>
              <button
                onClick={() => onNavigate('shop')}
                className="border-2 border-white text-white px-6 md:px-8 py-2 md:py-4 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-all duration-300 text-sm md:text-base"
              >
                View Categories
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Banners Section */}
      {banners.length > 0 && (
        <section className="py-2 md:py-3 overflow-hidden">
          {banners.map((banner) => (
            <div
              key={banner._id}
              className="relative py-2 md:py-3 text-white overflow-hidden"
              style={{
                backgroundColor: banner.backgroundColor || '#dc2626',
                color: banner.textColor || '#ffffff',
              }}
            >
              <div className="relative whitespace-nowrap animate-scroll-text">
                <p className="font-bold text-xs md:text-sm inline-block pr-8">
                  ✨ Special Offer: Get {banner.discountPercentage}% OFF on your order today!
                </p>
                <p className="font-bold text-xs md:text-sm inline-block pr-8">
                  ✨ Special Offer: Get {banner.discountPercentage}% OFF on your order today!
                </p>
              </div>
              <style>{`
                @keyframes scroll-text {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .animate-scroll-text {
                  animation: scroll-text 15s linear infinite;
                }
              `}</style>
            </div>
          ))}
        </section>
      )}

      {/* Categories Section - Horizontal Carousel */}
      <section className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
              Shop by Category
            </h2>
            <p className="text-xs md:text-sm text-gray-600">Explore our diverse range of premium products</p>
          </div>
          
          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-4 gap-6">
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => onNavigate('shop', { category: category.slug })}
                className="group relative h-48 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <img
                  src={category.imageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="p-4 w-full">
                    <h3 className="text-white font-semibold text-lg line-clamp-2">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Mobile Horizontal Scroll */}
          <div className="md:hidden relative">
            <div
              id="categoryScroll"
              className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scroll-smooth"
              style={{ scrollBehavior: 'smooth' }}
            >
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => onNavigate('shop', { category: category.slug })}
                  className="group relative h-32 w-40 flex-shrink-0 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <img
                    src={category.imageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-2 w-full">
                      <h3 className="text-white font-semibold text-xs line-clamp-2">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {categories.length > 3 && (
              <div className="flex gap-2 justify-center mt-4">
                <button
                  onClick={() => {
                    const element = document.getElementById('categoryScroll');
                    if (element) element.scrollBy({ left: -300, behavior: 'smooth' });
                  }}
                  className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const element = document.getElementById('categoryScroll');
                    if (element) element.scrollBy({ left: 300, behavior: 'smooth' });
                  }}
                  className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-8 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
              Featured Products
            </h2>
            <p className="text-xs md:text-sm text-gray-600">Handpicked favorites from our collection</p>
          </div>
          
          {featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm md:text-lg">No featured products available</p>
              <button
                onClick={loadData}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
              >
                Reload Data
              </button>
            </div>
          ) : (
            <>
              {/* Mobile Horizontal Scroll */}
              <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4">
                <div className="flex gap-4 w-max">
                  {featuredProducts.map((product) => (
                    <div key={product._id} className="w-64 flex-shrink-0 bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                      <div className="relative overflow-hidden">
                        <img
                          src={product.images[0]?.url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'}
                          alt={product.name}
                          className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                          onClick={() => onNavigate('product', { slug: product._id })}
                        />
                        {product.discountPrice && (
                          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
                          </div>
                        )}
                        <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                          <Heart className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                      <div className="p-4">
                        <h3
                          onClick={() => onNavigate('product', { slug: product._id })}
                          className="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-red-600 transition-colors line-clamp-2"
                        >
                          {product.name}
                        </h3>
                        <div className="flex items-center space-x-1 mb-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                          <span className="text-sm text-gray-500">({product.reviewCount})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            {product.discountPrice ? (
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-red-600">
                                  ₹{product.discountPrice}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  ₹{product.price}
                                </span>
                              </div>
                            ) : (
                              <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
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
                        {product.totalStock === 0 && (
                          <p className="text-red-600 text-sm mt-2">Out of Stock</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Grid View */}
              <div className="hidden md:grid grid-cols-2 gap-6">
                {featuredProducts.map((product) => (
                  <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="relative overflow-hidden">
                    <img
                      src={product.images[0]?.url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'}
                      alt={product.name}
                      className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                      onClick={() => onNavigate('product', { slug: product._id })}
                    />
                    {product.discountPrice && (
                      <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
                      </div>
                    )}
                    <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                      <Heart className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3
                      onClick={() => onNavigate('product', { slug: product._id })}
                      className="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-red-600 transition-colors line-clamp-2"
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center space-x-1 mb-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                      <span className="text-sm text-gray-500">({product.reviewCount})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        {product.discountPrice ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-red-600">
                              ₹{product.discountPrice}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              ₹{product.price}
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
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
                    {product.totalStock === 0 && (
                      <p className="text-red-600 text-sm mt-2">Out of Stock</p>
                    )}
                  </div>
                </div>
              ))}
              </div>
            </>
          )}
          
          <div className="text-center mt-8 md:mt-12">
            <button
              onClick={() => onNavigate('shop')}
              className="bg-red-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center space-x-2 text-sm md:text-base"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 md:w-5 h-4 md:h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="w-12 md:w-16 h-12 md:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg className="w-6 md:w-8 h-6 md:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-sm md:text-lg mb-2">Premium Quality</h3>
              <p className="text-xs md:text-sm text-gray-600">100% authentic products with quality guarantee</p>
            </div>
            <div className="text-center">
              <div className="w-12 md:w-16 h-12 md:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg className="w-6 md:w-8 h-6 md:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-sm md:text-lg mb-2">Secure Payments</h3>
              <p className="text-xs md:text-sm text-gray-600">Multiple payment options with secure checkout</p>
            </div>
            <div className="text-center">
              <div className="w-12 md:w-16 h-12 md:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg className="w-6 md:w-8 h-6 md:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-sm md:text-lg mb-2">Easy Returns</h3>
              <p className="text-xs md:text-sm text-gray-600">7-day return policy for all products</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}