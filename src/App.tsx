import { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ConsentBanner } from './components/ConsentBanner';
import { pageView, initWebVitalsMonitor } from './lib/analytics';

// Lazy-load non-critical routes to drastically minimize initial JS payload and Long Tasks
const ShopPage = lazy(() => import('./pages/ShopPage').then(m => ({ default: m.ShopPage })));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage').then(m => ({ default: m.CategoriesPage })));
const ProductPage = lazy(() => import('./pages/ProductPage').then(m => ({ default: m.ProductPage })));
const CartPage = lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const WishlistPage = lazy(() => import('./pages/WishlistPage').then(m => ({ default: m.WishlistPage })));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage').then(m => ({ default: m.BlogDetailPage })));
const UserAccountPage = lazy(() => import('./pages/UserAccountPage'));
const UserOrdersPage = lazy(() => import('./pages/UserOrdersPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage').then(m => ({ default: m.OrderConfirmationPage })));
const CustomDesignsPage = lazy(() => import('./pages/CustomDesignsPage').then(m => ({ default: m.CustomDesignsPage })));
const PolicyPage = lazy(() => import('./pages/PolicyPage').then(m => ({ default: m.PolicyPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Lazy-load Admin routes (never required for customer browsing)
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminBannersPage = lazy(() => import('./pages/admin/AdminBannersPage'));
const AdminBlogPage = lazy(() => import('./pages/admin/AdminBlogPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));
const AdminCustomDesignsPage = lazy(() => import('./pages/admin/AdminCustomDesignsPage'));

const PageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

interface NavigationParams {
  slug?: string;
  buyNow?: boolean;
  category?: string;
  orderId?: string;
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState<NavigationParams>({});
  const [navigationHistory, setNavigationHistory] = useState<Array<{ page: string; params: NavigationParams }>>([]);

  useEffect(() => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    if (path.startsWith('/admin')) {
      if (path === '/admin/products') {
        setCurrentPage('admin-products');
      } else if (path === '/admin/orders') {
        setCurrentPage('admin-orders');
      } else if (path === '/admin/users') {
        setCurrentPage('admin-users');
      } else if (path === '/admin/categories') {
        setCurrentPage('admin-categories');
      } else if (path === '/admin/banners') {
        setCurrentPage('admin-banners');
      } else if (path === '/admin/blogs') {
        setCurrentPage('admin-blogs');
      } else if (path === '/admin/analytics') {
        setCurrentPage('admin-analytics');
      } else if (path === '/admin/custom-designs') {
        setCurrentPage('admin-custom-designs');
      } else if (path === '/admin/settings') {
        setCurrentPage('admin-settings');
      } else {
        setCurrentPage('admin-dashboard');
      }
    } else if (path === '/shop') {
      setCurrentPage('shop');
      const category = searchParams.get('category');
      if (category) {
        setPageParams({ category });
      }
    } else if (path === '/categories') {
      setCurrentPage('categories');
    } else if (path.startsWith('/product/')) {
      const slug = path.replace('/product/', '');
      setCurrentPage('product');
      setPageParams({ slug });
    } else if (path === '/cart') {
      setCurrentPage('cart');
    } else if (path === '/checkout') {
      setCurrentPage('checkout');
    } else if (path === '/wishlist') {
      setCurrentPage('wishlist');
    } else if (path === '/blog') {
      setCurrentPage('blog');
    } else if (path.startsWith('/blog/')) {
      const slug = path.replace('/blog/', '');
      setCurrentPage('blog-detail');
      setPageParams({ slug });
    } else if (path === '/login') {
      setCurrentPage('login');
    } else if (path === '/register') {
      setCurrentPage('register');
    } else if (path === '/forgot-password') {
      setCurrentPage('forgot-password');
    } else if (path === '/account') {
      setCurrentPage('account');
    } else if (path === '/orders') {
      setCurrentPage('orders');
    } else if (path === '/custom-design') {
      setCurrentPage('custom-design');
    } else if (path.startsWith('/order-confirmation/')) {
      const orderId = path.replace('/order-confirmation/', '');
      setCurrentPage('order-confirmation');
      setPageParams({ orderId });
    } else if (path === '/privacy-policy') {
      setCurrentPage('privacy-policy');
    } else if (path === '/terms-of-service') {
      setCurrentPage('terms-of-service');
    } else if (path === '/shipping-policy') {
      setCurrentPage('shipping-policy');
    } else if (path === '/return-refund-policy') {
      setCurrentPage('return-refund-policy');
    } else if (path === '/' || path === '') {
      setCurrentPage('home');
    } else {
      setCurrentPage('404');
    }

    // Initialize Web Vitals observer (CLS, LCP)
    initWebVitalsMonitor();
  }, []);

  // TRK-04: Fire SPA PageView on every route change
  useEffect(() => {
    pageView(window.location.pathname + window.location.search);
  }, [currentPage]);

  useEffect(() => {
    const handlePopstate = () => {
      if (navigationHistory.length > 0) {
        const previousEntry = navigationHistory[navigationHistory.length - 1];
        setCurrentPage(previousEntry.page);
        setPageParams(previousEntry.params);
        setNavigationHistory(prev => prev.slice(0, -1));
      }
    };

    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, [navigationHistory]);

  const handleNavigate = (page: string, params?: NavigationParams) => {
    console.log('🔄 Navigation:', page, params);
    setNavigationHistory(prev => [...prev, { page: currentPage, params: pageParams }]);
    setCurrentPage(page);
    setPageParams(params || {});
    window.scrollTo(0, 0);

    if (page.startsWith('admin')) {
      const routes: Record<string, string> = {
        'admin-dashboard': '/admin',
        'admin-products': '/admin/products',
        'admin-orders': '/admin/orders',
        'admin-users': '/admin/users',
        'admin-categories': '/admin/categories',
        'admin-banners': '/admin/banners',
        'admin-blogs': '/admin/blogs',
        'admin-analytics': '/admin/analytics',
        'admin-custom-designs': '/admin/custom-designs',
        'admin-settings': '/admin/settings',
      };
      window.history.pushState({ page, params }, '', routes[page] || '/admin');
    } else {
      const routes: Record<string, string> = {
        'home': '/',
        'shop': '/shop',
        'categories': '/categories',
        'product': `/product/${params?.slug}`,
        'cart': '/cart',
        'checkout': '/checkout',
        'wishlist': '/wishlist',
        'blog': '/blog',
        'blog-detail': `/blog/${params?.slug}`,
        'login': '/login',
        'register': '/register',
        'forgot-password': '/forgot-password',
        'account': '/account',
        'orders': '/orders',
        'custom-design': '/custom-design',
        'order-confirmation': `/order-confirmation/${params?.orderId}`,
        'privacy-policy': '/privacy-policy',
        'terms-of-service': '/terms-of-service',
        'shipping-policy': '/shipping-policy',
        'return-refund-policy': '/return-refund-policy',
      };
      
      let url = routes[page] || '/';
      if (params?.category && page === 'shop') {
        url += `?category=${encodeURIComponent(params.category)}`;
      }
      
      window.history.pushState({ page, params }, '', url);
    }
  };

  const renderPage = () => {
    if (currentPage.startsWith('admin')) {
      return <AdminRoutes currentPage={currentPage} onNavigate={handleNavigate} />;
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'shop':
        return <ShopPage onNavigate={handleNavigate} initialCategory={pageParams.category} />;
      case 'categories':
        return <CategoriesPage onNavigate={handleNavigate} />;
      case 'product':
        return <ProductPage slug={pageParams.slug || ''} onNavigate={handleNavigate} />;
      case 'cart':
        return <CartPage onNavigate={handleNavigate} />;
      case 'checkout':
        return <CheckoutPage onNavigate={handleNavigate} />;
      case 'wishlist':
        return <WishlistPage onNavigate={handleNavigate} />;
      case 'blog':
        return <BlogPage onNavigate={handleNavigate} />;
      case 'blog-detail':
        return <BlogDetailPage slug={pageParams.slug || ''} onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case 'forgot-password':
        return <ForgotPasswordPage onNavigate={handleNavigate} />;
      case 'account':
        return <UserAccountPage onNavigate={handleNavigate} />;
      case 'orders':
        return <UserOrdersPage onNavigate={handleNavigate} />;
      case 'custom-design':
        return <CustomDesignsPage onNavigate={handleNavigate} />;
      case 'order-confirmation':
        return <OrderConfirmationPage orderId={pageParams.orderId || ''} onNavigate={handleNavigate} />;
      case 'privacy-policy':
        return <PolicyPage type="privacy" onNavigate={handleNavigate} />;
      case 'terms-of-service':
        return <PolicyPage type="terms" onNavigate={handleNavigate} />;
      case 'shipping-policy':
        return <PolicyPage type="shipping" onNavigate={handleNavigate} />;
      case 'return-refund-policy':
        return <PolicyPage type="returns" onNavigate={handleNavigate} />;
      case '404':
        return <NotFoundPage onNavigate={handleNavigate} />;
      default:
        return <NotFoundPage onNavigate={handleNavigate} />;
    }
  };

  const isAdminPage = currentPage.startsWith('admin');

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminPage && <Navbar onNavigate={handleNavigate} currentPage={currentPage} />}
      <main className={isAdminPage ? '' : 'flex-1'}>
        <Suspense fallback={<PageFallback />}>
          {renderPage()}
        </Suspense>
      </main>
      {!isAdminPage && <Footer />}
      <ConsentBanner />
    </div>
  );
}

function AdminRoutes({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: string) => void }) {
  const { isAuthenticated, loading } = useAdminAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated && currentPage !== 'admin-login') {
      console.log('Not authenticated, redirecting to login');
      onNavigate('login');
    }
  }, [isAuthenticated, loading, currentPage, onNavigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-slate-600">Loading admin panel...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-slate-600">Redirecting to login...</div>
      </div>
    );
  }

  console.log('🏗️ Rendering admin page:', currentPage);

  return (
    <Suspense fallback={<PageFallback />}>
      {(() => {
        switch (currentPage) {
          case 'admin-products':
            return <AdminProductsPage onNavigate={onNavigate} />;
          case 'admin-orders':
            return <AdminOrdersPage onNavigate={onNavigate} />;
          case 'admin-users':
            return <AdminUsersPage onNavigate={onNavigate} />;
          case 'admin-categories':
            return <AdminCategoriesPage onNavigate={onNavigate} />;
          case 'admin-banners':
            return <AdminBannersPage onNavigate={onNavigate} />;
          case 'admin-blogs':
            return <AdminBlogPage onNavigate={onNavigate} />;
          case 'admin-analytics':
            return <AdminAnalyticsPage onNavigate={onNavigate} />;
          case 'admin-custom-designs':
            return <AdminCustomDesignsPage onNavigate={onNavigate} />;
          case 'admin-settings':
            return <AdminSettingsPage onNavigate={onNavigate} />;
          case 'admin-dashboard':
          default:
            return <AdminDashboardPage onNavigate={onNavigate} />;
        }
      })()}
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AdminAuthProvider>
            <AppContent />
          </AdminAuthProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;