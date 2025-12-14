// Use absolute URLs for both environments since frontend and backend are on different domains
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? 'https://astroskulture.in/api'  // Absolute URL in production
    : 'http://localhost:5000/api' // Local development
  );

console.log('🌍 API Base URL:', API_BASE_URL);
console.log('🚀 Environment:', import.meta.env.PROD ? 'production' : 'development');

class ApiService {
  async request(endpoint: string, options: RequestInit = {}, isAdmin: boolean = false) {
    // Determine which token to use based on the isAdmin flag
    const token = isAdmin ? localStorage.getItem('adminToken') : localStorage.getItem('token');
    const url = `${API_BASE_URL}${endpoint}`;

    // Enhanced logging for debugging
    console.log(`🔄 API Request: ${url}`, {
      isAdmin,
      hasToken: !!token,
      tokenType: isAdmin ? 'adminToken' : 'userToken',
      endpoint,
      method: options.method || 'GET'
    });

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Handle connection errors
      if (!response.ok && response.status === 0) {
        throw new Error('Cannot connect to backend server. Please check if the server is running.');
      }

      if (!response.ok) {
        // Try to parse error response and extract the message
        let errorMessage = `HTTP ${response.status}`;
        try {
          const data = await response.json();
          // Prioritize the backend's error message
          errorMessage = data.message || data.error || `API request failed: ${response.status}`;
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || `API request failed: ${response.status}`;
        }

        // Create an error with the backend message and preserve the status code
        const error: any = new Error(errorMessage);
        error.status = response.status;
        error.statusText = response.statusText;
        throw error;
      }

      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ API request error:', {
        endpoint,
        url,
        error: errorMessage,
        status: (error as any)?.status
      });
      throw error;
    }
  }

  // Auth methods - regular user auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
  }

  // Admin methods - use isAdmin: true
  async adminLogin(username: string, password: string) {
    return this.request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }, true); // FIXED: Added isAdmin: true
  }

  // Product methods (public) - no auth required
  async getProducts(params?: { category?: string; featured?: boolean; search?: string; page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();

    if (params?.category) queryParams.append('category', params.category);
    if (params?.featured) queryParams.append('featured', 'true');
    if (params?.search) queryParams.append('search', params.search);
    if (params && params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params && params.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    return this.request(`/products${queryString ? `?${queryString}` : ''}`);
  }

  async getProduct(id: string) {
    console.log('📦 [DEBUG] Fetching product by ID:', id);
    return this.request(`/products/${id}`);
  }

  async getProductBySlug(slug: string) {
    console.log('📦 [DEBUG] Fetching product by slug:', slug);
    try {
      const response = await this.request(`/products/slug/${slug}`);
      console.log('✅ [DEBUG] Product by slug response:', response);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ [DEBUG] Error fetching product by slug:', {
        slug,
        error: errorMessage
      });
      throw error;
    }
  }

  async getFeaturedProducts() {
    return this.request('/products/featured');
  }

  async getProductsByCategory(categorySlug: string) {
    return this.request(`/products/category/${categorySlug}`);
  }

  // Debug methods
  async debugGetAllProducts() {
    console.log('🔍 [DEBUG] Getting all products for debugging');
    return this.request('/products/debug/all');
  }

  // Wishlist methods - regular user auth (NOT admin)
  async getWishlist() {
    console.log('💖 [DEBUG] Fetching user wishlist');
    try {
      const response = await this.request('/wishlist'); // FIXED: No isAdmin flag
      console.log('✅ [DEBUG] Wishlist response:', response);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ [DEBUG] Error fetching wishlist:', {
        error: errorMessage
      });
      throw error;
    }
  }

  async addToWishlist(productId: string) {
    console.log('💖 [DEBUG] Adding product to wishlist:', productId);
    try {
      const response = await this.request('/wishlist', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      }); // FIXED: No isAdmin flag
      console.log('✅ [DEBUG] Add to wishlist response:', response);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ [DEBUG] Error adding to wishlist:', {
        productId,
        error: errorMessage
      });
      throw error;
    }
  }

  async removeFromWishlist(productId: string) {
    console.log('💖 [DEBUG] Removing product from wishlist:', productId);
    try {
      const response = await this.request(`/wishlist/${productId}`, {
        method: 'DELETE',
      }); // FIXED: No isAdmin flag
      console.log('✅ [DEBUG] Remove from wishlist response:', response);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ [DEBUG] Error removing from wishlist:', {
        productId,
        error: errorMessage
      });
      throw error;
    }
  }

  async checkWishlistStatus(productId: string) {
    console.log('💖 [DEBUG] Checking wishlist status for product:', productId);
    try {
      const response = await this.request(`/wishlist/check/${productId}`); // FIXED: No isAdmin flag
      console.log('✅ [DEBUG] Wishlist status response:', response);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ [DEBUG] Error checking wishlist status:', {
        productId,
        error: errorMessage
      });
      throw error;
    }
  }

  // NEW: Clear entire wishlist
  async clearWishlist() {
    console.log('💖 [DEBUG] Clearing entire wishlist');
    try {
      const response = await this.request('/wishlist', {
        method: 'DELETE',
      });
      console.log('✅ [DEBUG] Clear wishlist response:', response);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ [DEBUG] Error clearing wishlist:', {
        error: errorMessage
      });
      throw error;
    }
  }

  // NEW: Add multiple products to wishlist
  async addMultipleToWishlist(productIds: string[]) {
    console.log('💖 [DEBUG] Adding multiple products to wishlist:', productIds);
    try {
      const response = await this.request('/wishlist/bulk', {
        method: 'POST',
        body: JSON.stringify({ productIds }),
      });
      console.log('✅ [DEBUG] Add multiple to wishlist response:', response);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ [DEBUG] Error adding multiple to wishlist:', {
        productIds,
        error: errorMessage
      });
      throw error;
    }
  }

  // NEW: Get wishlist count
  async getWishlistCount() {
    console.log('💖 [DEBUG] Getting wishlist count');
    try {
      const response = await this.request('/wishlist/count');
      console.log('✅ [DEBUG] Wishlist count response:', response);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ [DEBUG] Error getting wishlist count:', {
        error: errorMessage
      });
      throw error;
    }
  }

  // Admin methods - use isAdmin: true
  async adminGetProducts() {
    return this.request('/admin/products', {}, true);
  }

  async adminCreateProduct(productData: any) {
    return this.request('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }, true);
  }

  async adminUpdateProduct(id: string, productData: any) {
    return this.request(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    }, true);
  }

  async adminDeleteProduct(id: string) {
    return this.request(`/admin/products/${id}`, {
      method: 'DELETE',
    }, true);
  }

  async adminGetOrders() {
    return this.request('/admin/orders', {}, true);
  }

  async adminUpdateOrderStatus(id: string, status: string) {
    return this.request(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }, true);
  }

  async adminGetUsers() {
    return this.request('/admin/users', {}, true);
  }

  async adminGetStats() {
    return this.request('/admin/stats', {}, true);
  }

  // User methods (regular user routes) - regular user auth
  async updateProfile(userData: any) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    }); // FIXED: No isAdmin flag
  }

  async addAddress(addressData: any) {
    return this.request('/users/address', {
      method: 'POST',
      body: JSON.stringify(addressData),
    }); // FIXED: No isAdmin flag
  }

  // Order methods - regular user auth
  async createOrder(orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }); // FIXED: No isAdmin flag
  }

  async getOrders() {
    return this.request('/orders/my-orders'); // FIXED: No isAdmin flag
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`); // FIXED: No isAdmin flag
  }

  // Category methods - public
  async getCategories() {
    return this.request('/categories');
  }

  async getCategoriesWithCounts() {
    return this.request('/products/categories/with-counts');
  }

  // Category methods - admin
  async adminGetAllCategories() {
    return this.request('/admin/categories', {}, true);
  }

  async adminCreateCategory(categoryData: any) {
    return this.request('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    }, true);
  }

  async adminUpdateCategory(id: string, categoryData: any) {
    return this.request(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    }, true);
  }

  async adminDeleteCategory(id: string) {
    return this.request(`/admin/categories/${id}`, {
      method: 'DELETE',
    }, true);
  }

  // Blog methods
  async getBlogs() {
    return this.request('/blogs');
  }

  async getBlog(slug: string) {
    return this.request(`/blogs/${slug}`);
  }

  async adminGetAllBlogs() {
    return this.request('/blogs/admin/all', {}, true);
  }

  async adminCreateBlog(blogData: any) {
    return this.request('/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData),
    }, true);
  }

  async adminUpdateBlog(id: string, blogData: any) {
    return this.request(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(blogData),
    }, true);
  }

  async adminDeleteBlog(id: string) {
    return this.request(`/blogs/${id}`, {
      method: 'DELETE',
    }, true);
  }

  // Banner methods
  async getBanners() {
    return this.request('/banners');
  }

  async adminGetAllBanners() {
    return this.request('/banners/admin/all', {}, true);
  }

  async adminCreateBanner(bannerData: any) {
    return this.request('/banners', {
      method: 'POST',
      body: JSON.stringify(bannerData),
    }, true);
  }

  async adminUpdateBanner(id: string, bannerData: any) {
    return this.request(`/banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bannerData),
    }, true);
  }

  async adminDeleteBanner(id: string) {
    return this.request(`/banners/${id}`, {
      method: 'DELETE',
    }, true);
  }

  // Review methods
  async getProductReviews(productId: string) {
    return this.request(`/reviews/product/${productId}`);
  }

  async getUserReview(productId: string) {
    return this.request(`/reviews/user/${productId}`);
  }

  async createReview(reviewData: { productId: string; rating: number; title?: string; comment?: string }) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async updateReview(reviewId: string, reviewData: { rating?: number; title?: string; comment?: string }) {
    return this.request(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  }

  async deleteReview(reviewId: string) {
    return this.request(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  async markReviewHelpful(reviewId: string) {
    return this.request(`/reviews/${reviewId}/helpful`, {
      method: 'POST',
    });
  }

  async createPaymentOrder(paymentData: any) {
    return this.request('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async verifyPayment(verificationData: any) {
    return this.request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });
  }

  async recordPaymentFailure(failureData: any) {
    return this.request('/payments/failure', {
      method: 'POST',
      body: JSON.stringify(failureData),
    });
  }

  async getPaymentDetails(paymentId: string) {
    return this.request(`/payments/details/${paymentId}`);
  }

  // Settings methods
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(settingsData: any) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    }, true);
  }
  async masterReset(options: { products?: boolean; orders?: boolean; users?: boolean; reviews?: boolean; all?: boolean }) {
    return this.request('/admin/reset-db', {
      method: 'POST',
      body: JSON.stringify(options),
    }, true);
  }
}

export const apiService = new ApiService();