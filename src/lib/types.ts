// User Types
export interface User {
  _id: string;
  email: string;
  fullName: string;
  phone?: string;
  addresses: Address[];
  role: 'customer' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id?: string;
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

// Product Types
export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string; // Reference to category ID
  categoryData?: Category; // Populated category data
  price: number;
  discountPrice?: number;
  images: ProductImage[];
  sizes: ProductSize[];
  totalStock: number;
  isFeatured: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  url: string;
  alt: string;
}

export interface ProductSize {
  size: string;
  stock: number;
}

// Category Types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Order Types
export interface Order {
  _id: string;
  userId?: string;
  user?: User;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  shippingAddress: Address;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  product?: Product;
  name: string;
  price: number;
  quantity: number;
  size: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Cart Types
export interface CartItem {
  productId: string;
  product?: Product;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// Product Filter Types
export interface ProductFilters {
  category?: string;
  featured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  inStock?: boolean;
}

export interface ProductQueryParams {
  category?: string;
  featured?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Admin Types
export interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: Order[];
  lowStockProducts: Product[];
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  images: ProductImage[];
  sizes: ProductSize[];
  isFeatured: boolean;
  isActive: boolean;
  tags: string[];
}

export interface CategoryFormData {
  name: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

// Review Types
export interface Review {
  _id: string;
  userId: string;
  user?: User;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

// Wishlist Types
export interface WishlistItem {
  _id: string;
  userId: string;
  productId: string;
  product?: Product;
  createdAt: string;
}

// Payment Types
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}