import { useEffect, useState } from 'react';
import { Heart, Star, ArrowRight, ChevronLeft, ChevronRight, ShoppingCart, Check } from 'lucide-react';
import { apiService } from '../lib/mongodb';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { optimizeImageUrl } from '../utils/imageUtils';
import { updatePageSeo } from '../utils/seoUtils';
import { ProductCardSkeleton } from './ProductCard';

interface Product {
  _id: string;
  name: string;
  slug?: string;
  price: number;
  discountPrice?: number;
  images: Array<{ url: string; alt: string }>;
  sizes: Array<{ size: string; stock: number }>;
  totalStock: number;
  isFeatured: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  brand?: string;
  isBestseller?: boolean;
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
  title?: string;
  displayText?: string;
  discountPercentage: number;
  textColor?: string;
  backgroundColor?: string;
  displayOrder: number;
  isActive: boolean;
}

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
}

// Product Card Component
function ProductCard({ 
  product, 
  onNavigate,
  onWishlistToggle,
  isInWishlist,
  wishlistLoading
}: { 
  product: Product; 
  onNavigate: (page: string, params?: any) => void;
  onWishlistToggle: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistLoading: string | null;
}) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercentage = hasDiscount 
    ? Math.round((1 - product.discountPrice! / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.totalStock === 0) return;

    const defaultSize = product.sizes?.find((s: any) => s.stock > 0)?.size || 'M';
    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      gstPercentage: 0,
      gstApplicable: false,
      shippingFee: 0,
      freeShippingAbove: 0,
      size: defaultSize,
      image: product.images[0]?.url || '',
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.totalStock === 0) return;

    const defaultSize = product.sizes?.find((s: any) => s.stock > 0)?.size || 'M';
    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      gstPercentage: 0,
      gstApplicable: false,
      shippingFee: 0,
      freeShippingAbove: 0,
      size: defaultSize,
      image: product.images[0]?.url || '',
    });

    onNavigate('checkout');
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden group hover:shadow-lg transition-all duration-300 h-full flex flex-col border border-gray-200">
      <div className="relative overflow-hidden flex-shrink-0 w-full aspect-square bg-gray-100">
        <a
          href={`/product/${product.slug || product._id}`}
          onClick={(e) => {
            e.preventDefault();
            onNavigate('product', { slug: product.slug || product._id });
          }}
          className="block w-full h-full"
          aria-label={product.name}
        >
          <img
            src={product.images[0]?.url ? optimizeImageUrl(product.images[0]?.url, { width: 400, quality: 'auto:good' }) : '/hero-banner-mobile.webp'}
            srcSet={product.images[0]?.url ? `${optimizeImageUrl(product.images[0]?.url, { width: 280, quality: 'auto:good' })} 280w, ${optimizeImageUrl(product.images[0]?.url, { width: 400, quality: 'auto:good' })} 400w, ${optimizeImageUrl(product.images[0]?.url, { width: 600, quality: 'auto:good' })} 600w` : undefined}
            sizes="(max-width: 640px) 180px, (max-width: 1024px) 292px, 400px"
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
            loading="lazy"
            decoding="async"
            width={400}
            height={400}
          />
        </a>
        
        {/* Bestseller Badge */}
        {product.isBestseller && (
          <div className="absolute top-2 left-2">
            <div className="bg-gray-800 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide">
              BESTSELLER
            </div>
          </div>
        )}
        
        {/* Wishlist Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onWishlistToggle(product);
          }}
          disabled={wishlistLoading === product._id}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 disabled:opacity-50"
          aria-label={isInWishlist(product._id) ? `Remove ${product.name} from Wishlist` : `Add ${product.name} to Wishlist`}
        >
          {wishlistLoading === product._id ? (
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Heart 
              className={`w-4 h-4 sm:w-5 sm:h-5 ${isInWishlist(product._id) ? 'fill-red-600 text-red-600' : 'text-gray-400'}`}
            />
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
            href={`/product/${product.slug || product._id}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate('product', { slug: product.slug || product._id });
            }}
            className="hover:text-red-600"
          >
            {product.name}
          </a>
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center bg-green-700 text-white px-2 py-0.5 rounded text-xs font-semibold">
            <span>{(product.rating || 0).toFixed(1)}★</span>
          </div>
          <span className="text-xs text-gray-600">| {product.reviewCount || 0}</span>
        </div>
        
        {/* Price Section */}
        <div className="flex-grow mb-3">
          <div className="flex items-baseline gap-2 flex-wrap mb-1">
            <span className="text-base md:text-lg font-bold text-gray-900">
              ₹{formatPrice(product.discountPrice || product.price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xs md:text-sm text-gray-500 line-through">
                  ₹{formatPrice(product.price)}
                </span>
                <span className="text-xs md:text-sm font-bold text-emerald-700">
                  {discountPercentage}% off
                </span>
              </>
            )}
          </div>
          
          {/* Offer Price Label */}
          {hasDiscount && (
            <div className="flex items-center gap-1 mt-1">
              <div className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                <span>✓</span>
                <span>Offer Price: ₹{formatPrice(product.discountPrice!)}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Stock Warning */}
        {product.totalStock > 0 && product.totalStock < 10 && (
          <p className="text-amber-800 text-xs mb-2 font-semibold">Only {product.totalStock} left</p>
        )}
        
        {/* Out of Stock */}
        {product.totalStock === 0 && (
          <p className="text-red-600 text-xs mb-2 font-semibold">Out of Stock</p>
        )}

        {/* Action Buttons: Add to Cart & Buy Now */}
        <div className="mt-auto pt-2.5 border-t border-gray-100 flex flex-col sm:flex-row gap-2">
          {product.totalStock === 0 ? (
            <button
              disabled
              className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-gray-100 text-gray-400 cursor-not-allowed"
            >
              Out of Stock
            </button>
          ) : (
            <>
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center transition-all border ${
                  isAdded
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50 active:scale-95'
                }`}
                aria-label={`Add ${product.name} to cart`}
              >
                {isAdded ? (
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
                onClick={handleBuyNow}
                className="flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 active:scale-95 flex items-center justify-center transition-all shadow-sm"
                aria-label={`Buy ${product.name} now`}
              >
                Buy Now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product[]>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<{ heroBannerDesktop?: string; heroBannerMobile?: string; announcementText?: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    updatePageSeo({
      title: 'ASTROS KULTURE | Premium Oversized Streetwear & Anime Fashion',
      description: 'Discover premium oversized t-shirts, anime streetwear, and cosmic custom designs at Astros Kulture. High quality cotton, bold graphics, free shipping.',
      canonicalUrl: 'https://astroskulture.in/',
      ogType: 'website',
      structuredData: [
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "ASTROS KULTURE",
          "url": "https://astroskulture.in",
          "logo": "https://astroskulture.in/logo.png",
          "sameAs": [
            "https://www.instagram.com/astroskulture",
            "https://www.facebook.com/astroskulture"
          ]
        },
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "ASTROS KULTURE",
          "url": "https://astroskulture.in",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://astroskulture.in/shop?search={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }
      ]
    });
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError('');

      // Fetch public store settings (hero banners, announcements)
      apiService.getSettings().then((res: any) => {
        if (res && res.success && res.data) {
          setSettings(res.data);
        }
      }).catch(() => {});
      
      // Fast path: Unified high-performance homepage endpoint (single roundtrip, lean MongoDB projection)
      try {
        const homeRes: any = await apiService.getHomepageData();
        if (homeRes && homeRes.success) {
          if (homeRes.banners) {
            const activeBanners = (homeRes.banners || []).filter((b: Banner) => b.isActive);
            setBanners(activeBanners.sort((a: Banner, b: Banner) => a.displayOrder - b.displayOrder));
          }
          if (homeRes.categories) {
            setCategories(homeRes.categories);
          }
          if (homeRes.featuredProducts) {
            setFeaturedProducts(homeRes.featuredProducts);
          }
          if (homeRes.categoryProducts) {
            setCategoryProducts(homeRes.categoryProducts);
          }
          setLoading(false);
          return;
        }
      } catch (homeErr) {
        console.warn('Unified homepage endpoint failed, falling back to parallel fetch:', homeErr);
      }

      // Fallback: Parallel requests if unified route is unavailable
      const [productsResponse, categoriesResponse, bannersResponse] = await Promise.all([
        apiService.getProducts({ featured: true }).catch(() => ({ success: false, data: [] })),
        apiService.getCategories().catch(() => ({ success: false, data: [] })),
        apiService.getBanners().catch(() => ({ success: false, data: [] }))
      ]);
      
      if (productsResponse.success) {
        setFeaturedProducts(productsResponse.data || []);
      }

      if (bannersResponse.success) {
        const activeBanners = (bannersResponse.data || []).filter((b: Banner) => b.isActive);
        setBanners(activeBanners.sort((a: Banner, b: Banner) => a.displayOrder - b.displayOrder));
      }

      if (categoriesResponse.success) {
        const loadedCategories = categoriesResponse.data || [];
        setCategories(loadedCategories);
        
        // Parallel fetch products for first 4 categories
        const categoryProductsMap: Record<string, Product[]> = {};
        const categorySlice = loadedCategories.slice(0, 4);
        
        const catResults = await Promise.all(
          categorySlice.map(async (category: Category) => {
            try {
              const res = await apiService.getProducts({ category: category.slug });
              return { slug: category.slug, products: res.success ? (res.data || []).slice(0, 10) : [] };
            } catch {
              return { slug: category.slug, products: [] };
            }
          })
        );

        for (const item of catResults) {
          categoryProductsMap[item.slug] = item.products;
        }
        setCategoryProducts(categoryProductsMap);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
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
        await addToWishlist(product as any);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setWishlistLoading(null);
    }
  };


  if (error && !loading) {
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
      {/* Top Announcement / Dynamic Banners Section (Above Hero) */}
      {loading ? (
        <section className="py-2 md:py-2.5 overflow-hidden bg-red-700 min-h-[38px] flex items-center justify-center">
          <p className="font-bold text-xs md:text-sm text-white tracking-wide">
            {settings.announcementText || '✨ Free Shipping on orders above ₹999 Pan-India | 100% Premium Cotton'}
          </p>
        </section>
      ) : banners.length > 0 ? (
        <section className="py-2 md:py-2.5 overflow-hidden min-h-[38px]">
          {banners.map((banner) => (
            <div
              key={banner._id}
              className="relative py-2 md:py-2 text-white overflow-hidden shadow-inner"
              style={{
                backgroundColor: banner.backgroundColor || '#dc2626',
                color: banner.textColor || '#ffffff',
              }}
            >
              <div className="relative whitespace-nowrap animate-scroll-text">
                <p className="font-bold text-xs md:text-sm inline-block pr-8 tracking-wide">
                  ✨ {banner.displayText || `Special Offer: Get ${banner.discountPercentage}% OFF on your order today!`}
                </p>
                <p className="font-bold text-xs md:text-sm inline-block pr-8 tracking-wide">
                  ✨ {banner.displayText || `Special Offer: Get ${banner.discountPercentage}% OFF on your order today!`}
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
      ) : (
        <section className="py-2 md:py-2.5 overflow-hidden bg-red-700 min-h-[38px] flex items-center justify-center">
          <p className="font-bold text-xs md:text-sm text-white tracking-wide">
            {settings.announcementText || '✨ Free Shipping on orders above ₹999 Pan-India | 100% Premium Cotton'}
          </p>
        </section>
      )}

      {/* Hero Section */}
      <section className="relative min-h-[480px] md:h-[500px] bg-gradient-to-r from-red-600 to-red-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <picture>
            <source 
              media="(max-width: 640px)" 
              srcSet={settings.heroBannerMobile || '/hero-banner-mobile.webp'} 
              type="image/webp" 
            />
            <img
              src={settings.heroBannerDesktop || '/hero-banner.webp'}
              alt="Astros Kulture streetwear collection"
              className="w-full h-full object-cover"
              width={1200}
              height={500}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                if (!img.src.endsWith('/hero-banner.webp')) {
                  img.src = '/hero-banner.webp';
                }
              }}
            />
          </picture>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 min-h-[500px] md:h-full flex flex-col justify-center py-8 md:py-0">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-2 mb-3 md:mb-4">
              <Star className="w-6 md:w-8 h-6 md:h-8 fill-white" />
              <span className="text-lg md:text-2xl font-bold">ASTROS KULTURE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              Streetwear From Another Universe
            </h1>
            <p className="text-sm md:text-lg mb-6 md:mb-8 text-gray-100 leading-relaxed">
              Step into Astros - where oversized meets attitude. A signature drop of oversized tees, customized tees, and premium cotton t-shirts built for all-day comfort and bold self-expression. Clean fits, premium fabric, and quality that speaks loud - Astros is more than style, it's a statement.
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
                View Astros Drop
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Horizontal Carousel */}
      <section className="py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3">
              Browse the Universe
            </h2>
            <p className="text-xs md:text-sm text-gray-600">Explore our premium fits crafted for everyday confidence</p>
          </div>
          
          {/* Desktop Grid */}
          {loading ? (
            <div className="hidden md:grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 rounded-lg bg-gray-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="hidden md:grid grid-cols-4 gap-6">
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => onNavigate('shop', { category: category.slug })}
                  aria-label={`Shop ${category.name} collection`}
                  className="group relative h-48 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <img
                    src={category.imageUrl ? optimizeImageUrl(category.imageUrl, { width: 400, quality: 'auto' }) : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width={400}
                    height={192}
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
          )}

          {/* Mobile Horizontal Scroll */}
          {loading ? (
            <div className="md:hidden flex gap-3 overflow-x-hidden pb-4 -mx-4 px-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 w-40 flex-shrink-0 rounded-lg bg-gray-200 animate-pulse" />
              ))}
            </div>
          ) : (
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
                    aria-label={`Shop ${category.name} collection`}
                    className="group relative h-32 w-40 flex-shrink-0 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <img
                      src={category.imageUrl ? optimizeImageUrl(category.imageUrl, { width: 220, quality: 'auto' }) : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=220&auto=format'}
                      alt=""
                      aria-hidden="true"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      width={160}
                      height={128}
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
                    aria-label="Scroll categories left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const element = document.getElementById('categoryScroll');
                      if (element) element.scrollBy({ left: 300, behavior: 'smooth' });
                    }}
                    className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700"
                    aria-label="Scroll categories right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-6 md:py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3">
              Astros Picks
            </h2>
            <p className="text-xs md:text-sm text-gray-600">Handpicked for your vibe</p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  onNavigate={onNavigate}
                  onWishlistToggle={handleWishlistToggle}
                  isInWishlist={isInWishlist}
                  wishlistLoading={wishlistLoading}
                />
              ))}
            </div>
          )}
          
          <div className="text-center mt-6 md:mt-8">
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

      {/* Category-wise Product Sections Loading Skeleton */}
      {loading && (
        <section className="py-6 md:py-10 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
            </div>
            <div className="overflow-x-auto pb-2 -mx-4 px-4">
              <div className="flex gap-4 md:gap-6 min-w-min">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-48 md:w-56 flex-shrink-0">
                    <ProductCardSkeleton />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category-wise Product Sections */}
      {categories.slice(0, 4).map((category, index) => {
        const products = categoryProducts[category.slug] || [];
        if (products.length === 0) return null;
        
        return (
          <section key={category._id} className={`py-6 md:py-10 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-1">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-xs md:text-sm text-gray-600">{category.description}</p>
                  )}
                </div>
                <button
                  onClick={() => onNavigate('shop', { category: category.slug })}
                  className="text-red-600 hover:text-red-700 font-medium text-sm md:text-base flex items-center gap-1"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              {/* Horizontal Scroll for 5 Latest Products */}
              <div className="overflow-x-auto pb-2 -mx-4 px-4">
                <div className="flex gap-4 md:gap-6 min-w-min">
                  {products.slice(0, 5).map((product) => (
                    <div key={product._id} className="w-48 md:w-56 flex-shrink-0">
                      <ProductCard 
                        product={product} 
                        onNavigate={onNavigate}
                        onWishlistToggle={handleWishlistToggle}
                        isInWishlist={isInWishlist}
                        wishlistLoading={wishlistLoading}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* View All Button */}
              {products.length > 5 && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => onNavigate('shop', { category: category.slug })}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center space-x-2 text-sm md:text-base"
                  >
                    <span>View All {category.name} Products</span>
                    <ArrowRight className="w-4 md:w-5 h-4 md:h-5" />
                  </button>
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* Features Section */}
      <section className="py-3 md:py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="text-center py-2 md:py-3">
              <div className="w-12 md:w-16 h-12 md:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-1 md:mb-2">
                <svg className="w-6 md:w-8 h-6 md:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-sm md:text-base mb-0.5">Premium Quality</h3>
              <p className="text-xs text-gray-600">100% authentic products with quality guarantee</p>
            </div>
            <div className="text-center py-2 md:py-3">
              <div className="w-12 md:w-16 h-12 md:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-1 md:mb-2">
                <svg className="w-6 md:w-8 h-6 md:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-sm md:text-base mb-0.5">Secure Payments</h3>
              <p className="text-xs text-gray-600">Multiple payment options with secure checkout</p>
            </div>
            <div className="text-center py-2 md:py-3">
              <div className="w-12 md:w-16 h-12 md:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-1 md:mb-2">
                <svg className="w-6 md:w-8 h-6 md:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-sm md:text-base mb-0.5">Easy Returns</h3>
              <p className="text-xs text-gray-600">7-day return policy for all products</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}