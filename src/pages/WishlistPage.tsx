import { useEffect, useState } from 'react';
import { Heart, ShoppingCart, Star, Trash2, ArrowLeft, AlertCircle, Plus, X } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import type { WishlistItem } from '../lib/types';

interface WishlistPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export function WishlistPage({ onNavigate }: WishlistPageProps) {
  const { 
    wishlist, 
    loading, 
    error: wishlistError, 
    removeFromWishlist, 
    refreshWishlist,
    clearWishlist,
    clearError,
    operationLoading 
  } = useWishlist();
  
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [removing, setRemoving] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Combine errors from context and local state
  const error = wishlistError || localError;

  useEffect(() => {
    refreshWishlist();
  }, []);

  // Clear success message after delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleRemoveFromWishlist = async (productId: string, productName?: string) => {
    try {
      setRemoving(productId);
      setLocalError(null);
      clearError();
      
      const success = await removeFromWishlist(productId);
      
      if (success) {
        setSuccessMessage(`"${productName || 'Product'}" removed from wishlist`);
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setLocalError('Failed to remove item from wishlist. Please try again.');
    } finally {
      setRemoving(null);
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    if (!item.product) return;
    
    try {
      setAddingToCart(item.productId);
      setLocalError(null);
      clearError();
      
      const defaultSize = item.product.sizes?.find(size => size.stock > 0)?.size || 'M';
      
      addToCart({
        productId: item.product._id,
        name: item.product.name,
        price: item.product.discountPrice || item.product.price,
        quantity: 1,
        size: defaultSize,
        image: item.product.images[0]?.url || '',
      });
      
      setSuccessMessage(`"${item.product.name}" added to cart!`);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      setLocalError('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(null);
    }
  };

  const handleClearWishlist = async () => {
    if (wishlist.length === 0) return;
    
    try {
      setClearing(true);
      setLocalError(null);
      clearError();
      
      const success = await clearWishlist();
      
      if (success) {
        setSuccessMessage('Wishlist cleared successfully');
      } else {
        throw new Error('Failed to clear wishlist');
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      setLocalError('Failed to clear wishlist. Please try again.');
    } finally {
      setClearing(false);
    }
  };

  const handleProductClick = (slug?: string) => {
    if (slug) {
      onNavigate('product', { slug });
    }
  };

  const getProductImage = (item: WishlistItem) => {
    return item.product?.images[0]?.url || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500';
  };

  const getProductName = (item: WishlistItem) => {
    return item.product?.name || 'Product not available';
  };

  const getProductPrice = (item: WishlistItem) => {
    return item.product?.discountPrice || item.product?.price || 0;
  };

  const getOriginalPrice = (item: WishlistItem) => {
    return item.product?.price || 0;
  };

  const hasDiscount = (item: WishlistItem) => {
    return item.product?.discountPrice && item.product.discountPrice < item.product.price;
  };

  const getDiscountPercentage = (item: WishlistItem) => {
    if (!item.product?.discountPrice || !item.product?.price) return 0;
    return Math.round((1 - item.product.discountPrice / item.product.price) * 100);
  };

  const isProductAvailable = (item: WishlistItem) => {
    return item.product && item.product.totalStock > 0;
  };

  const getStockStatus = (item: WishlistItem) => {
    if (!item.product) return 'unavailable';
    if (item.product.totalStock === 0) return 'out-of-stock';
    if (item.product.totalStock < 10) return 'low-stock';
    return 'in-stock';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // Show authentication required
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md">
          <Heart className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view and manage your wishlist.</p>
          <button
            onClick={() => onNavigate('login')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <Plus className="w-3 h-3 text-white transform rotate-45" />
              </div>
              <p className="text-green-800 text-sm">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-600 hover:text-green-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={() => { setLocalError(null); clearError(); }}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <button 
                onClick={() => onNavigate('shop')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4 lg:mb-2 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Shop
              </button>
              <div className="flex items-center space-x-4">
                <div className="bg-red-50 p-3 rounded-full">
                  <Heart className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                  <p className="text-gray-600 mt-1">
                    {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
                  </p>
                </div>
              </div>
            </div>
            
            {wishlist.length > 0 && (
              <div className="mt-4 lg:mt-0">
                <button
                  onClick={handleClearWishlist}
                  disabled={clearing || operationLoading}
                  className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {clearing ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Wishlist Content */}
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Heart className="w-20 h-20 text-gray-200 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-2">Save items you love for later!</p>
            <p className="text-gray-500 text-sm mb-8">Click the heart icon on any product to add it here.</p>
            <button
              onClick={() => onNavigate('shop')}
              className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlist.map((item) => {
              const stockStatus = getStockStatus(item);
              const isAvailable = isProductAvailable(item);
              const productName = getProductName(item);
              
              return (
                <div key={item._id} className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
                  <div className="relative">
                    <img
                      src={getProductImage(item)}
                      alt={productName}
                      className="w-full h-48 md:h-72 object-cover cursor-pointer transition-transform group-hover:scale-105"
                      onClick={() => handleProductClick(item.product?.slug)}
                    />
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300" />
                    
                    {/* Remove from wishlist button */}
                    <button
                      onClick={() => handleRemoveFromWishlist(item.productId, productName)}
                      disabled={removing === item.productId || operationLoading}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      title="Remove from wishlist"
                    >
                      {removing === item.productId ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>

                    {/* Discount badge */}
                    {hasDiscount(item) && (
                      <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                        {getDiscountPercentage(item)}% OFF
                      </div>
                    )}

                    {/* Stock status badge */}
                    {stockStatus === 'out-of-stock' && (
                      <div className="absolute bottom-3 left-3 bg-gray-600 text-white px-2 py-1 rounded text-xs font-medium">
                        Out of Stock
                      </div>
                    )}
                    {stockStatus === 'low-stock' && (
                      <div className="absolute bottom-3 left-3 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Low Stock
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 md:p-4">
                    {/* Product name */}
                    <h3
                      className="font-semibold text-sm md:text-base text-gray-900 mb-2 cursor-pointer hover:text-red-600 transition-colors line-clamp-2"
                      onClick={() => handleProductClick(item.product?.slug)}
                      title={productName}
                    >
                      {productName}
                    </h3>
                    
                    {/* Rating */}
                    {item.product?.rating && (
                      <div className="flex items-center space-x-1 mb-3">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {item.product.rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({item.product.reviewCount || 0})
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-base md:text-lg font-bold text-gray-900">
                        ₹{formatPrice(getProductPrice(item))}
                      </span>
                      {hasDiscount(item) && (
                        <span className="text-xs md:text-sm text-gray-500 line-through">
                          ₹{formatPrice(getOriginalPrice(item))}
                        </span>
                      )}
                    </div>

                    {/* Add to cart button */}
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!isAvailable || addingToCart === item.productId || operationLoading}
                      className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
                    >
                      {addingToCart === item.productId ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {isAvailable ? 'Add to Cart' : 'Out of Stock'}
                        </>
                      )}
                    </button>

                    {/* Additional info */}
                    {!item.product && (
                      <p className="text-gray-500 text-xs mt-2 text-center">
                        Product no longer available
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Loading overlay for operations */}
        {(operationLoading && !loading) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700">Processing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}