import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../lib/mongodb';
import type { WishlistItem, Product } from '../lib/types';

interface WishlistContextType {
  wishlist: WishlistItem[];
  loading: boolean;
  error: string | null;
  addToWishlist: (product: Product) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
  wishlistCount: number;
  clearError: () => void;
  clearWishlist: () => Promise<boolean>;
  addMultipleToWishlist: (products: Product[]) => Promise<boolean>;
  getWishlistCount: () => Promise<number>;
  operationLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const refreshWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('💖 [CONTEXT] Refreshing wishlist...');
      
      // FIXED: Check if user is authenticated before making wishlist request
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('💖 [CONTEXT] No user token found, skipping wishlist fetch');
        setWishlist([]);
        setError('Please log in to view your wishlist');
        return;
      }
      
      const data = await apiService.getWishlist();
      
      if (data.success) {
        console.log('💖 [CONTEXT] Wishlist refreshed successfully:', data.data.length, 'items');
        setWishlist(data.data);
      } else {
        throw new Error(data.message || 'Failed to load wishlist');
      }
    } catch (error: any) {
      console.error('❌ [CONTEXT] Error refreshing wishlist:', error);
      
      // Handle specific error cases
      if (error.message.includes('No token provided') || 
          error.message.includes('authorization denied') ||
          error.message.includes('401')) {
        setError('Please log in to view your wishlist');
        setWishlist([]);
      } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        setError('Unable to connect to server. Please check your connection.');
      } else {
        setError(error.message || 'Failed to load wishlist');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // FIXED: Only refresh wishlist if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      refreshWishlist();
    } else {
      setLoading(false);
      setWishlist([]);
      console.log('💖 [CONTEXT] No user token, wishlist not loaded');
    }
  }, []);

  const addToWishlist = async (product: Product): Promise<boolean> => {
    try {
      setOperationLoading(true);
      setError(null);
      console.log('💖 [CONTEXT] Adding to wishlist:', product._id, product.name);
      
      // FIXED: Check authentication before adding to wishlist
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to add items to wishlist');
        return false;
      }
      
      const data = await apiService.addToWishlist(product._id);
      
      if (data.success) {
        console.log('💖 [CONTEXT] Added to wishlist successfully');
        await refreshWishlist();
        return true;
      } else {
        throw new Error(data.message || 'Failed to add to wishlist');
      }
    } catch (error: any) {
      console.error('❌ [CONTEXT] Error adding to wishlist:', error);
      
      if (error.message.includes('already in wishlist')) {
        setError('This product is already in your wishlist');
      } else if (error.message.includes('not found')) {
        setError('Product not found or not available');
      } else if (error.message.includes('401') || error.message.includes('authorization')) {
        setError('Please log in to add items to wishlist');
      } else {
        setError(error.message || 'Failed to add to wishlist');
      }
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string): Promise<boolean> => {
    try {
      setOperationLoading(true);
      setError(null);
      console.log('💖 [CONTEXT] Removing from wishlist:', productId);
      
      // FIXED: Check authentication before removing from wishlist
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to manage your wishlist');
        return false;
      }
      
      const data = await apiService.removeFromWishlist(productId);
      
      if (data.success) {
        console.log('💖 [CONTEXT] Removed from wishlist successfully');
        setWishlist(prev => prev.filter(item => item.productId !== productId));
        return true;
      } else {
        throw new Error(data.message || 'Failed to remove from wishlist');
      }
    } catch (error: any) {
      console.error('❌ [CONTEXT] Error removing from wishlist:', error);
      
      if (error.message.includes('401') || error.message.includes('authorization')) {
        setError('Please log in to manage your wishlist');
      } else {
        setError(error.message || 'Failed to remove from wishlist');
      }
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  const clearWishlist = async (): Promise<boolean> => {
    try {
      setOperationLoading(true);
      setError(null);
      console.log('💖 [CONTEXT] Clearing entire wishlist');
      
      // FIXED: Check authentication before clearing wishlist
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to manage your wishlist');
        return false;
      }
      
      // Use the clearWishlist API endpoint
      const response = await apiService.request('/wishlist', {
        method: 'DELETE'
      });
      
      if (response.success) {
        setWishlist([]);
        console.log('💖 [CONTEXT] Wishlist cleared successfully');
        return true;
      } else {
        throw new Error(response.message || 'Failed to clear wishlist');
      }
    } catch (error: any) {
      console.error('❌ [CONTEXT] Error clearing wishlist:', error);
      
      if (error.message.includes('401') || error.message.includes('authorization')) {
        setError('Please log in to manage your wishlist');
      } else {
        setError(error.message || 'Failed to clear wishlist');
      }
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  const addMultipleToWishlist = async (products: Product[]): Promise<boolean> => {
    try {
      setOperationLoading(true);
      setError(null);
      console.log('💖 [CONTEXT] Adding multiple products to wishlist:', products.length);
      
      // FIXED: Check authentication before bulk operations
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to add items to wishlist');
        return false;
      }
      
      // Use the bulk add API endpoint
      const productIds = products.map(product => product._id);
      const response = await apiService.request('/wishlist/bulk', {
        method: 'POST',
        body: JSON.stringify({ productIds })
      });
      
      if (response.success) {
        console.log('💖 [CONTEXT] Added multiple products:', response.addedCount, 'successful');
        
        // Refresh the wishlist to get the updated state
        await refreshWishlist();
        
        if (response.alreadyExistsCount > 0) {
          setError(`Added ${response.addedCount} out of ${products.length} products to wishlist (${response.alreadyExistsCount} already existed)`);
        }
        
        return response.addedCount > 0;
      } else {
        throw new Error(response.message || 'Failed to add products to wishlist');
      }
    } catch (error: any) {
      console.error('❌ [CONTEXT] Error adding multiple to wishlist:', error);
      
      if (error.message.includes('401') || error.message.includes('authorization')) {
        setError('Please log in to add items to wishlist');
        return false;
      }
      
      // Fallback to individual requests if bulk endpoint fails
      console.log('💖 [CONTEXT] Falling back to individual requests');
      const addPromises = products.map(product => 
        apiService.addToWishlist(product._id).catch(err => {
          console.warn('❌ [CONTEXT] Failed to add product:', product._id, err.message);
          return null;
        })
      );
      
      const results = await Promise.all(addPromises);
      const successCount = results.filter(result => result?.success).length;
      
      console.log('💖 [CONTEXT] Added multiple products (fallback):', successCount, 'successful');
      
      await refreshWishlist();
      
      if (successCount < products.length) {
        setError(`Added ${successCount} out of ${products.length} products to wishlist`);
      }
      
      return successCount > 0;
    } finally {
      setOperationLoading(false);
    }
  };

  const getWishlistCount = async (): Promise<number> => {
    try {
      // Use the local state for count, but you could also call an API endpoint if available
      return wishlist.length;
    } catch (error) {
      console.error('❌ [CONTEXT] Error getting wishlist count:', error);
      return wishlist.length;
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some(item => item.productId === productId);
  };

  const wishlistCount = wishlist.length;

  // Debug effect to log wishlist changes
  useEffect(() => {
    console.log('💖 [CONTEXT] Wishlist updated:', {
      count: wishlist.length,
      items: wishlist.map(item => ({
        id: item._id,
        productId: item.productId,
        productName: item.product?.name
      }))
    });
  }, [wishlist]);

  const value: WishlistContextType = {
    wishlist,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refreshWishlist,
    wishlistCount,
    clearError,
    clearWishlist,
    addMultipleToWishlist,
    getWishlistCount,
    operationLoading
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};