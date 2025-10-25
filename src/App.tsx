import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import UserAccountPage from './pages/UserAccountPage';
import UserOrdersPage from './pages/UserOrdersPage';

interface NavigationParams {
  slug?: string;
  buyNow?: boolean;
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState<NavigationParams>({});

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      if (path === '/admin/products') {
        setCurrentPage('admin-products');
      } else if (path === '/admin/orders') {
        setCurrentPage('admin-orders');
      } else if (path === '/admin/users') {
        setCurrentPage('admin-users');
      } else {
        setCurrentPage('admin-dashboard');
      }
    }
  }, []);

  const handleNavigate = (page: string, params?: NavigationParams) => {
    console.log('🔄 Navigation:', page, params);
    setCurrentPage(page);
    setPageParams(params || {});
    window.scrollTo(0, 0);

    if (page.startsWith('admin')) {
      const routes: Record<string, string> = {
        'admin-dashboard': '/admin',
        'admin-products': '/admin/products',
        'admin-orders': '/admin/orders',
        'admin-users': '/admin/users',
      };
      window.history.pushState({}, '', routes[page] || '/admin');
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
      case 'categories':
        return <ShopPage onNavigate={handleNavigate} />;
      case 'product':
        return <ProductPage slug={pageParams.slug || ''} onNavigate={handleNavigate} />;
      case 'cart':
        return <CartPage onNavigate={handleNavigate} />;
      case 'checkout':
        return <CheckoutPage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case 'account':
        return <UserAccountPage onNavigate={handleNavigate} />;
      case 'orders':
        return <UserOrdersPage onNavigate={handleNavigate} />;
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
      return <AdminProductsPage onNavigate={onNavigate} />; // FIXED: Added onNavigate prop
    case 'admin-orders':
      return <AdminOrdersPage onNavigate={onNavigate} />; // FIXED: Added onNavigate prop
    case 'admin-users':
      return <AdminUsersPage onNavigate={onNavigate} />; // FIXED: Added onNavigate prop
    case 'admin-dashboard':
    default:
      return <AdminDashboardPage onNavigate={onNavigate} />;
  }
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AdminAuthProvider>
          <AppContent />
        </AdminAuthProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;