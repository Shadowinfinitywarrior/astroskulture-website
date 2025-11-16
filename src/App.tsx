import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { WishlistPage } from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { BlogPage } from './pages/BlogPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminBannersPage from './pages/admin/AdminBannersPage';
import AdminBlogPage from './pages/admin/AdminBlogPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import UserAccountPage from './pages/UserAccountPage';
import UserOrdersPage from './pages/UserOrdersPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';

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
    } else if (path.startsWith('/order-confirmation/')) {
      const orderId = path.replace('/order-confirmation/', '');
      setCurrentPage('order-confirmation');
      setPageParams({ orderId });
    }
  }, []);

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
        'order-confirmation': `/order-confirmation/${params?.orderId}`,
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
      case 'order-confirmation':
        return <OrderConfirmationPage orderId={pageParams.orderId || ''} onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  const isAdminPage = currentPage.startsWith('admin');

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminPage && <Navbar onNavigate={handleNavigate} currentPage={currentPage} />}
      <main className={isAdminPage ? '' : 'flex-1'}>{renderPage()}</main>
      {!isAdminPage && <Footer />}
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
    case 'admin-dashboard':
    default:
      return <AdminDashboardPage onNavigate={onNavigate} />;
  }
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