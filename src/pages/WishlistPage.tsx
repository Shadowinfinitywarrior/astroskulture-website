import { useEffect, useState } from 'react';
import { Heart, ShoppingCart, Star, Trash2, ArrowLeft } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import type { WishlistItem } from '../lib/types';

interface WishlistPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export function WishlistPage({ onNavigate }: WishlistPageProps) {
  const { wishlist, loading, removeFromWishlist, refreshWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    refreshWishlist();
  }, []);

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      setRemoving(productId);
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setRemoving(null);
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    if (!item.product) return;
    
    const defaultSize = item.product.sizes?.find(size => size.stock > 0)?.size || 'M';
    
    addToCart({
      productId: item.product._id,
      name: item.product.name,
      price: item.product.discountPrice || item.product.price,
      quantity: 1,
      size: defaultSize,
      image: item.product.images[0]?.url || '',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <button 
                onClick={() => onNavigate('shop')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shop
              </button>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600 mt-1">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in your wishlist
              </p>
            </div>
            <div className="text-right">
              <Heart className="w-8 h-8 text-red-600 mx-auto" />
            </div>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Save items you love for later!</p>
            <button
              onClick={() => onNavigate('shop')}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={item.product?.images[0]?.url || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'}
                    alt={item.product?.name}
                    className="w-full h-64 object-cover cursor-pointer"
                    onClick={() => onNavigate('product', { slug: item.product?.slug })}
                  />
                  <button
                    onClick={() => handleRemoveFromWishlist(item.productId)}
                    disabled={removing === item.productId}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    {removing === item.productId ? (
                      <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
                
                <div className="p-4">
                  <h3
                    className="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-red-600 transition-colors line-clamp-2"
                    onClick={() => onNavigate('product', { slug: item.product?.slug })}
                  >
                    {item.product?.name}
                  </h3>
                  
                  <div className="flex items-center space-x-1 mb-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">{(item.product?.rating || 0).toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({item.product?.reviewCount || 0})</span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{item.product?.discountPrice || item.product?.price}
                      </span>
                      {item.product?.discountPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{item.product?.price}
                        </span>
                      )}
                    </div>
                    {item.product?.discountPrice && (
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold">
                        {Math.round((1 - item.product.discountPrice / item.product.price) * 100)}% OFF
                      </span>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.product || item.product.totalStock === 0}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </button>
                  </div>

                  {item.product && item.product.totalStock === 0 && (
                    <p className="text-red-600 text-sm mt-2 text-center">Out of Stock</p>
                  )}
                  {item.product && item.product.totalStock > 0 && item.product.totalStock < 10 && (
                    <p className="text-orange-600 text-sm mt-2 text-center">Only {item.product.totalStock} left</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}