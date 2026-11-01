import { useState } from 'react';
import { Heart, ShoppingCart, Star, Eye, Check } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import type { Product, NavigationParams } from '../lib/types';
import { optimizeImageUrl } from '../utils/imageUtils';

interface ProductCardProps {
  product: Product;
  onNavigate: (page: string, params?: NavigationParams) => void;
  showWishlist?: boolean;
}

export function ProductCard({ product, onNavigate, showWishlist = true }: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const { user } = useAuth();

  const isInWishlistState = isInWishlist(product._id);
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercentage = hasDiscount
    ? Math.round((1 - product.discountPrice! / product.price) * 100)
    : 0;
  const currentPrice = product.discountPrice || product.price;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      onNavigate('login');
      return;
    }

    try {
      setWishlistLoading(true);
      if (isInWishlistState) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      // Error is handled in the context, but we can add a toast notification here if needed
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (product.totalStock === 0) {
      // You could show a toast notification here
      console.log('Product is out of stock');
      return;
    }

    const defaultSize = product.sizes?.find(size => size.stock > 0)?.size || 'M';

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

    // You could add a success toast notification here
    console.log('Product added to cart:', product.name);

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.totalStock === 0) return;

    const defaultSize = product.sizes?.find(size => size.stock > 0)?.size || 'M';

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

  const handleProductClick = () => {
    onNavigate('product', { slug: product.slug });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    // You can implement a quick view modal here
    console.log('Quick view:', product.name);
    // For now, navigate to product page
    handleProductClick();
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const getStockStatus = () => {
    if (product.totalStock === 0) return 'out-of-stock';
    if (product.totalStock < 10) return 'low-stock';
    return 'in-stock';
  };

  const stockStatus = getStockStatus();
  const isAvailable = product.totalStock > 0;

  // Format price with Indian numbering system
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="relative overflow-hidden">
        {/* Product Image */}
        <div className="w-full aspect-square bg-gray-100 relative">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          <a
            href={`/product/${product.slug}`}
            onClick={(e) => {
              e.preventDefault();
              handleProductClick();
            }}
            aria-label={product.name}
            className="block w-full h-full"
          >
            <img
              src={imageError ? '/api/placeholder/300/300' : (product.images[0]?.url ? optimizeImageUrl(product.images[0]?.url, { width: 350, quality: 'auto' }) : '/api/placeholder/300/300')}
              srcSet={product.images[0]?.url ? `${optimizeImageUrl(product.images[0]?.url, { width: 300, quality: 'auto' })} 300w, ${optimizeImageUrl(product.images[0]?.url, { width: 500, quality: 'auto' })} 500w` : undefined}
              sizes="(max-width: 640px) 180px, (max-width: 1024px) 292px, 350px"
              alt={product.name}
              width={350}
              height={350}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
              loading="lazy"
              decoding="async"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </a>

          {/* Overlay with quick actions - only on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300">
            <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              {/* Quick View Button */}
              <button
                onClick={handleQuickView}
                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 hover:text-red-600 transition-colors"
                title="Quick View"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Wishlist Button - Bottom Right (Permanent) */}
          {showWishlist && (
            <button
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              className={`absolute bottom-3 right-3 p-2 rounded-full shadow-md transition-colors z-20 ${isInWishlistState
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isInWishlistState ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              {wishlistLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Heart className={`w-4 h-4 ${isInWishlistState ? 'fill-current' : ''}`} />
              )}
            </button>
          )}

          {/* Top Left Badges Container - Stacked */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
            {/* Bestseller Badge - Priority */}
            {product.isBestseller && (
              <div className="bg-gray-800 text-white px-3 py-1.5 rounded text-xs font-bold shadow-lg">
                BESTSELLER
              </div>
            )}

            {/* Featured Badge */}
            {product.isFeatured && !product.isBestseller && (
              <div className="bg-yellow-400 text-yellow-900 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-lg">
                ⭐ Featured
              </div>
            )}

            {/* Discount Badge */}
            {hasDiscount && !product.isBestseller && (
              <div className="bg-red-600 text-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                <span>🔥</span>
                <span>{discountPercentage}%</span>
              </div>
            )}

            {/* Stock Status Badge */}
            {stockStatus === 'out-of-stock' && (
              <div className="bg-gray-700 text-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow-lg">
                Out of Stock
              </div>
            )}
            {stockStatus === 'low-stock' && (
              <div className="bg-orange-500 text-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow-lg">
                Only {product.totalStock}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3">
        {/* Brand Name */}
        <div className="text-xs text-gray-600 uppercase tracking-wide mb-1 font-semibold">
          {product.brand || 'ASTROS KULTURE'}
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-sm text-gray-900 mb-2 hover:text-red-600 transition-colors line-clamp-2 leading-tight">
          <a
            href={`/product/${product.slug}`}
            onClick={(e) => {
              e.preventDefault();
              handleProductClick();
            }}
            title={product.name}
          >
            {product.name}
          </a>
        </h3>

        {/* Rating in Green Badge */}
        {(product.rating || product.reviewCount) && (
          <div className="flex items-center mb-2">
            <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
              <span>{product.rating?.toFixed(1) || '0.0'}</span>
              <Star className="w-3 h-3 fill-white" />
              <span className="text-xs">| {product.reviewCount || 0}</span>
            </div>
          </div>
        )}

        {/* Price Section */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 line-through">
              ₹{formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-green-600 text-xs font-bold">
                {discountPercentage}% off
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-gray-900">
              ₹{formatPrice(currentPrice)}
            </span>
          </div>
          {hasDiscount && (
            <div className="text-xs text-green-600 font-semibold">
              Offer Price: ₹{formatPrice(currentPrice)}
            </div>
          )}
        </div>

        {/* Sizes (if available) */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mt-2 flex items-center space-x-1">
            <span className="text-xs text-gray-500">Size:</span>
            <div className="flex space-x-0.5">
              {product.sizes.slice(0, 3).map((sizeData) => (
                <span
                  key={sizeData.size}
                  className={`text-xs px-1 py-0.5 rounded ${sizeData.stock > 0
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-gray-50 text-gray-400 line-through'
                    }`}
                >
                  {sizeData.size}
                </span>
              ))}
              {product.sizes.length > 3 && (
                <span className="text-xs text-gray-500">+{product.sizes.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {/* Tags (if available) */}
        {product.tags && product.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-0.5">
            {product.tags.slice(0, 1).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons: Add to Cart & Buy Now */}
        <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-col sm:flex-row gap-2">
          {!isAvailable ? (
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

// Skeleton loader for ProductCard with exact aspect-square reservation to prevent CLS
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse border border-gray-100 flex flex-col h-full">
      <div className="w-full aspect-square bg-gray-200"></div>
      <div className="p-3 space-y-2.5 flex-grow">
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-5 bg-gray-200 rounded w-1/3 mt-2"></div>
      </div>
    </div>
  );
}

export default ProductCard;