// Use absolute URLs for both environments since frontend and backend are on different domains
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD 
    ? 'https://astroskulture-website.onrender.com/api'  // Absolute URL in production
    : 'http://localhost:5000/api' // Local development
  );

console.log('🌍 API Base URL:', API_BASE_URL);
console.log('🚀 Environment:', import.meta.env.PROD ? 'production' : 'development');

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}, isAdmin: boolean = false) {
    // Use adminToken for admin routes, regular token for user routes
    const token = isAdmin ? localStorage.getItem('adminToken') : localStorage.getItem('token');
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Enhanced logging for debugging
    console.log(`🔄 API Request: ${url}`, { 
      isAdmin, 
      hasToken: !!token,
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
        const data = await response.json();
        throw new Error(data.message || `API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ API request error:', {
        endpoint,
        url,
        error: error.message
      });
      throw error;
    }
  }

  // Auth methods
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
    });
  }

  // Product methods (public)
  async getProducts(params?: { category?: string; featured?: boolean; search?: string; page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    
    if (params?.category) queryParams.append('category', params.category);
    if (params?.featured) queryParams.append('featured', 'true');
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
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
      console.error('❌ [DEBUG] Error fetching product by slug:', {
        slug,
        error: error.message
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

  // User methods (regular user routes)
  async updateProfile(userData: any) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async addAddress(addressData: any) {
    return this.request('/users/address', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  // Order methods
  async createOrder(orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders() {
    return this.request('/orders/my-orders');
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }

  // Category methods
  async getCategories() {
    return this.request('/categories');
  }

  async getCategoriesWithCounts() {
    return this.request('/products/categories/with-counts');
  }
}

export const apiService = new ApiService();