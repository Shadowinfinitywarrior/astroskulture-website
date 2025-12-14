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
  gstPercentage?: number;
  gstApplicable?: boolean;
  shippingFee?: number;
  freeShippingAbove?: number;
  images: ProductImage[];
  sizes: ProductSize[];
  totalStock: number;
  isFeatured: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  brand?: string; // New field for product brand (e.g., "RARE RABBIT")
  isBestseller?: boolean; // New field to mark bestseller products
  colors?: string[]; // New field for available colors
  fits?: string[]; // New field for available fits (e.g., "Regular Fit", "Slim Fit")
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
  fit?: string; // Optional fit property for sizes (e.g., "Regular Fit", "Slim Fit")
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
  discountPrice?: number;
  gstPercentage?: number;
  gstApplicable?: boolean;
  shippingFee?: number;
  freeShippingAbove?: number;
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
  sizes?: string[]; // Selected sizes for filtering
  fits?: string[]; // Selected fits for filtering
  colors?: string[]; // Selected colors for filtering
  minRating?: number; // Minimum rating filter
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
  brand?: string; // Product brand
  isBestseller?: boolean; // Mark as bestseller
  colors?: string[]; // Available colors
  fits?: string[]; // Available fits
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
  updatedAt?: string;
}

export interface WishlistResponse {
  success: boolean;
  data: WishlistItem[];
  message?: string;
  count?: number;
}

export interface WishlistStatusResponse {
  success: boolean;
  data: {
    inWishlist: boolean;
    wishlistItem?: WishlistItem;
  };
}

export interface AddToWishlistRequest {
  productId: string;
}

export interface AddToWishlistResponse {
  success: boolean;
  message: string;
  data: WishlistItem;
}

export interface RemoveFromWishlistResponse {
  success: boolean;
  message: string;
  removedItem?: string;
}

export interface WishlistCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

// Payment Types
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

// Context Types
export interface WishlistContextType {
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

export interface CartContextType {
  items: CartItem[];
  cartTotal: number;
  cartCount: number;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string, size: string) => number;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export interface AdminAuthContextType {
  admin: any | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// Navigation Types
export interface NavigationParams {
  slug?: string;
  buyNow?: boolean;
  id?: string;
}

// Component Props Types
export interface ProductCardProps {
  product: Product;
  onNavigate: (page: string, params?: NavigationParams) => void;
  showWishlist?: boolean;
}

export interface ProductPageProps {
  slug: string;
  onNavigate: (page: string, params?: NavigationParams) => void;
}

export interface WishlistPageProps {
  onNavigate: (page: string, params?: NavigationParams) => void;
}

export interface CartPageProps {
  onNavigate: (page: string, params?: NavigationParams) => void;
}

export interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone?: string;
}

export interface AddressFormData {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

// Utility Types
export type ApiServiceMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiRequestOptions {
  method?: ApiServiceMethod;
  headers?: Record<string, string>;
  body?: any;
  isAdmin?: boolean;
}

// Export all types with aliases
export type {
  User as UserType,
  Product as ProductType,
  Category as CategoryType,
  Order as OrderType,
  Cart as CartType,
  Review as ReviewType,
  WishlistItem as WishlistItemType,
  WishlistResponse as WishlistResponseType,
  WishlistStatusResponse as WishlistStatusResponseType,
  CartItem as CartItemType,
  Address as AddressType
};