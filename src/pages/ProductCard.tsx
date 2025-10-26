import { useState } from 'react';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import type { Product, NavigationParams } from '../lib/types';

interface ProductCardProps {
  product: Product;
  onNavigate: (page: string, params?: NavigationParams) => void;
  showWishlist?: boolean;
}

export function ProductCard({ product, onNavigate, showWishlist = true }: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { addToWishlist, removeFromWishlist, isInWishlist, operationLoading } = useWishlist();
  const { addToCart } = useCart();
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
      if (isInWishlistState) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (product.totalStock === 0) return;
    
    const defaultSize = product.sizes?.find(size => size.stock > 0)?.size || 'M';
    
    addToCart({
      productId: product._id,
      name: product.name,
      price: currentPrice,
      quantity: 1,
      size: defaultSize,
      image: product.images[0]?.url || '',
    });
  };

  const handleProductClick = () => {
    onNavigate('product', { slug: product.slug });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    // You can implement a quick view modal here
    console.log('Quick view:', product.name);
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

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="relative overflow-hidden">
        {/* Product Image */}
        <div 
          className="w-full h-64 bg-gray-100 cursor-pointer relative"
          onClick={handleProductClick}
        >
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          <img
            src={imageError ? '/api/placeholder/300/300' : product.images[0]?.url}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          
          {/* Overlay with quick actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300">
            <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* Quick View Button */}
              <button
                onClick={handleQuickView}
                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 hover:text-red-600 transition-colors"
                title="Quick View"
              >
                <Eye className="w-4 h-4" />
              </button>
              
              {/* Wishlist Button */}
              {showWishlist && (
                <button
                  onClick={handleWishlistToggle}
                  disabled={operationLoading}
                  className={`p-2 rounded-full shadow-md transition-colors ${
                    isInWishlistState
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isInWishlistState ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  {operationLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Heart className={`w-4 h-4 ${isInWishlistState ? 'fill-current' : ''}`} />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold shadow-sm">
              {discountPercentage}% OFF
            </div>
          )}

          {/* Stock Status Badge */}
          {stockStatus === 'out-of-stock' && (
            <div className="absolute top-3 left-3 bg-gray-600 text-white px-2 py-1 rounded text-xs font-semibold">
              Out of Stock
            </div>
          )}
          {stockStatus === 'low-stock' && (
            <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
              Low Stock
            </div>
          )}

          {/* Add to Cart Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-95 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
            <button
              onClick={handleAddToCart}
              disabled={!isAvailable}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium text-sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isAvailable ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          {product.categoryData?.name || 'Fashion'}
        </div>

        {/* Product Name */}
        <h3 
          className="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-red-600 transition-colors line-clamp-2 leading-tight"
          onClick={handleProductClick}
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Rating */}
        {(product.rating || product.reviewCount) && (
          <div className="flex items-center space-x-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating || 0)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-gray-700">
              {product.rating?.toFixed(1) || '0.0'}
            </span>
            <span className="text-xs text-gray-500">
              ({product.reviewCount || 0})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-lg font-bold text-gray-900">
              ₹{currentPrice}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.price}
              </span>
            )}
          </div>
          
          {/* Stock Indicator */}
          {stockStatus === 'low-stock' && product.totalStock > 0 && (
            <span className="text-xs text-orange-600 font-medium">
              Only {product.totalStock} left
            </span>
          )}
        </div>

        {/* Sizes (if available) */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mt-3 flex items-center space-x-1">
            <span className="text-xs text-gray-500">Sizes:</span>
            <div className="flex space-x-1">
              {product.sizes.slice(0, 4).map((sizeData) => (
                <span
                  key={sizeData.size}
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    sizeData.stock > 0
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-gray-50 text-gray-400 line-through'
                  }`}
                >
                  {sizeData.size}
                </span>
              ))}
              {product.sizes.length > 4 && (
                <span className="text-xs text-gray-500">+{product.sizes.length - 4}</span>
              )}
            </div>
          </div>
        )}

        {/* Tags (if available) */}
        {product.tags && product.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Featured Badge */}
      {product.isFeatured && (
        <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-semibold">
          Featured
        </div>
      )}
    </div>
  );
}

// Optional: Skeleton loader for ProductCard
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
      <div className="w-full h-64 bg-gray-200"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-200 rounded flex-1"></div>
          <div className="h-8 bg-gray-200 rounded w-8"></div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;