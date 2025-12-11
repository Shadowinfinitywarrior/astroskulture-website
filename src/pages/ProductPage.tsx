import { useEffect, useState } from 'react';
import { ShoppingCart, Heart, Star, Truck, Shield, RefreshCw, ArrowLeft } from 'lucide-react';
import { apiService } from '../lib/mongodb';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import type { Product } from '../lib/types';
import ProductImageGallery from '../components/ProductImageGallery';
import ProductReviews from '../components/ProductReviews';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface AppSettings {
  gstPercentage: number;
  gstEnabled: boolean;
  shippingFee: number;
  shippingEnabled: boolean;
  freeShippingAbove: number;
}

interface ProductPageProps {
  slug: string;
  onNavigate: (page: string, params?: any) => void;
}

export function ProductPage({ slug, onNavigate }: ProductPageProps) {
  const [product, setProduct] = useState < Product | null > (null);
  const [selectedSize, setSelectedSize] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState < AppSettings > ({
    gstPercentage: 18,
    gstEnabled: true,
    shippingFee: 69,
    shippingEnabled: true,
    freeShippingAbove: 999,
  });
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, operationLoading } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    loadProduct();
    loadSettings();
  }, [slug]);

  const loadSettings = async () => {
    try {
      const result = await apiService.getSettings();
      if (result.success) {
        setSettings(result.data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      // Keep default settings if loading fails
    }
  };

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await apiService.getProductBySlug(slug);

      if (data.success && data.data) {
        setProduct(data.data);
        // Set default size to first available size
        const availableSizes = data.data.sizes
          .filter((size: any) => size.stock > 0)
          .map((size: any) => size.size);

        if (availableSizes.length > 0) {
          setSelectedSize(availableSizes[0]);
        }
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error loading product:', err);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const selectedSizeData = product.sizes.find(size => size.size === selectedSize);
    if (!selectedSizeData || selectedSizeData.stock === 0) {
      alert('Selected size is out of stock');
      return;
    }

    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      gstPercentage: product.gstPercentage || 18,
      gstApplicable: product.gstApplicable !== undefined ? product.gstApplicable : true,
      shippingFee: product.shippingFee !== undefined ? product.shippingFee : 69,
      freeShippingAbove: product.freeShippingAbove !== undefined ? product.freeShippingAbove : 999,
      size: selectedSize,
      image: product.images[0]?.url || '',
    });
  };

  const handleBuyNow = () => {
    if (!user) {
      alert('Please login or sign up to proceed with your purchase');
      localStorage.setItem('returnToProduct', slug);
      onNavigate('login');
      return;
    }
    handleAddToCart();
    onNavigate('checkout');
  };

  const handleWishlistToggle = async () => {
    if (!product) return;

    try {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      // Error is handled in the context
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">{error || 'Product not found'}</p>
          <button
            onClick={() => onNavigate('shop')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const currentPrice = product.discountPrice || product.price;
  const discountPercentage = product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0;

  // Get category name - handle both category and categoryData
  const categoryName = product.categoryData?.name || 'Astros Kulture';
  const isProductInWishlist = isInWishlist(product._id);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation */}
        <button
          onClick={() => onNavigate('shop')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Shop
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-12">
          {/* Product Images */}
          <div className="min-w-0 order-1 lg:order-1">
            <ProductImageGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          {/* Product Details */}
          <div className="space-y-3 md:space-y-4 lg:space-y-6 order-2 lg:order-2">
            {/* Category & Brand */}
            <div className="space-y-1 md:space-y-2">
              <span className="text-xs text-red-600 font-medium uppercase tracking-wide">
                {categoryName}
              </span>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-1 md:space-x-2 flex-wrap">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 md:w-4 h-3.5 md:h-4 ${i < Math.floor(product.rating || 0)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                      }`}
                  />
                ))}
              </div>
              <span className="text-xs md:text-sm font-medium text-gray-700">{(product.rating || 0).toFixed(1)}</span>
              <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
            </div>

            {/* Pricing */}
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-baseline space-x-1.5 md:space-x-2 flex-wrap">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  ₹{currentPrice}
                </span>
                {product.discountPrice && (
                  <>
                    <span className="text-base md:text-lg text-gray-500 line-through">
                      ₹{product.price}
                    </span>
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-semibold">
                      {discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>
              {settings.gstEnabled && (
                <p className="text-xs text-gray-600">Inclusive of all taxes</p>
              )}
            </div>

            {/* Description */}
            <div className="prose prose-gray">
              <p className="text-xs md:text-sm lg:text-base text-gray-600 leading-relaxed">
                {product.description || 'Premium quality product with excellent craftsmanship and attention to detail.'}
              </p>
            </div>

            {/* Size Selection */}
            <div className="space-y-2 md:space-y-3">
              <div className="flex justify-between items-center gap-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  Select Size
                </label>
                <button className="text-xs text-gray-500 hover:text-gray-700 underline">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-1 md:gap-2">
                {product.sizes.map((sizeData) => (
                  <button
                    key={sizeData.size}
                    onClick={() => setSelectedSize(sizeData.size)}
                    disabled={sizeData.stock === 0}
                    className={`px-2 sm:px-3 md:px-6 py-1.5 sm:py-2 md:py-3 border-2 rounded-lg font-medium transition-all min-w-[44px] sm:min-w-[50px] md:min-w-[60px] relative text-xs md:text-sm ${selectedSize === sizeData.size
                        ? 'border-red-600 bg-red-600 text-white shadow-md'
                        : sizeData.stock > 0
                          ? 'border-gray-300 hover:border-red-600 hover:text-red-600 text-gray-700 hover:shadow-md'
                          : 'border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    {sizeData.size}
                    {sizeData.stock > 0 && sizeData.stock < 10 && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center text-[10px]">
                        {sizeData.stock}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-1.5 md:space-x-2">
              {product.totalStock > 0 ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">
                    In Stock ({product.totalStock})
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-4 items-center">
              <button
                onClick={handleAddToCart}
                disabled={product.totalStock === 0 || !selectedSize}
                className="w-full sm:flex-1 bg-gray-900 text-white py-3 md:py-4 px-4 md:px-6 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium shadow-sm text-sm md:text-base"
              >
                <ShoppingCart className="w-4 md:w-5 h-4 md:h-5 mr-1 md:mr-2" />
                <span className="hidden xs:inline">Add to Cart</span>
                <span className="inline xs:hidden">Add</span>
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.totalStock === 0 || !selectedSize}
                className="w-full sm:flex-1 bg-red-600 text-white py-3 md:py-4 px-4 md:px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-sm text-sm md:text-base"
              >
                Buy Now
              </button>
              <button
                onClick={handleWishlistToggle}
                disabled={operationLoading}
                className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:h-auto md:w-auto md:px-4 md:py-3 border-2 rounded-lg transition-colors shadow-sm flex items-center justify-center ${isProductInWishlist
                    ? 'border-red-600 bg-red-50 text-red-600 hover:bg-red-100'
                    : 'border-gray-300 text-gray-600 hover:border-red-600 hover:text-red-600 hover:bg-red-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isProductInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                {operationLoading ? (
                  <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Heart className={`w-5 h-5 md:w-6 md:h-6 ${isProductInWishlist ? 'fill-current' : ''}`} />
                )}
              </button>
            </div>

            {/* Wishlist Feedback */}
            {isProductInWishlist && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 md:p-3">
                <p className="text-green-800 text-xs md:text-sm flex items-center">
                  <Heart className="w-3 md:w-4 h-3 md:h-4 fill-current mr-2" />
                  This product is in your wishlist
                </p>
              </div>
            )}

            {/* Features */}
            <div className="space-y-2 md:space-y-3 border-t border-gray-200 pt-3 md:pt-4">
              <div className="flex items-center space-x-2 md:space-x-3 text-gray-600">
                <Truck className="w-4 md:w-5 h-4 md:h-5 text-red-600 flex-shrink-0" />
                <span className="text-xs md:text-sm">Free delivery on orders above ₹999</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 text-gray-600">
                <RefreshCw className="w-4 md:w-5 h-4 md:h-5 text-red-600 flex-shrink-0" />
                <span className="text-xs md:text-sm">7-day easy return policy</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 text-gray-600">
                <Shield className="w-4 md:w-5 h-4 md:h-5 text-red-600 flex-shrink-0" />
                <span className="text-xs md:text-sm">100% authentic products</span>
              </div>
            </div>

            {/* Additional Product Info */}
            <div className="border-t border-gray-200 pt-3 md:pt-4">
              <h3 className="font-semibold text-sm md:text-base text-gray-900 mb-2 md:mb-3">Product Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm text-gray-600">
                <div>
                  <span className="font-medium">Category:</span>{' '}
                  {categoryName}
                </div>
                <div>
                  <span className="font-medium">SKU:</span>{' '}
                  {product.slug.toUpperCase()}
                </div>
                <div>
                  <span className="font-medium">Availability:</span>{' '}
                  {product.totalStock > 0 ? 'In Stock' : 'Out of Stock'}
                </div>
                <div>
                  <span className="font-medium">Rating:</span>{' '}
                  {product.rating?.toFixed(1)}/5 ({product.reviewCount})
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Reviews Section */}
        <div className="mt-8 md:mt-12">
          <ProductReviews productId={product._id} />
        </div>
      </div>
    </div>
  );
}