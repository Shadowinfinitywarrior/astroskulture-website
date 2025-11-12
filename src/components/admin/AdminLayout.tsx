import { ReactNode, useState } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { LogOut, Package, ShoppingCart, Users, Home, Menu, X, Grid3x3, Image, BookOpen, BarChart3 } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function AdminLayout({ children, currentPage, onNavigate }: AdminLayoutProps) {
  const { admin, logout } = useAdminAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', icon: Home, page: 'dashboard', target: 'admin-dashboard' },
    { name: 'Products', icon: Package, page: 'products', target: 'admin-products' },
    { name: 'Orders', icon: ShoppingCart, page: 'orders', target: 'admin-orders' },
    { name: 'Users', icon: Users, page: 'users', target: 'admin-users' },
    { name: 'Categories', icon: Grid3x3, page: 'categories', target: 'admin-categories' },
    { name: 'Banners', icon: Image, page: 'banners', target: 'admin-banners' },
    { name: 'Blogs', icon: BookOpen, page: 'blogs', target: 'admin-blogs' },
    { name: 'Analytics', icon: BarChart3, page: 'analytics', target: 'admin-analytics' },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleNavClick = (target: string) => {
    // Close mobile sidebar when a link is clicked
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
    
    // Safety check for onNavigate function
    if (typeof onNavigate === 'function') {
      console.log('🔄 Navigating to:', target);
      onNavigate(target);
    } else {
      console.error('❌ onNavigate is not a function!');
      // Fallback navigation
      const route = target.replace('admin-', '/admin/');
      window.location.href = route;
    }
  };

  // Helper function to determine if a nav item is active
  const isNavActive = (navItem: typeof navigation[0]) => {
    return currentPage === navItem.page || currentPage === navItem.target;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            {/* Circular Logo for Mobile Header */}
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-300 flex items-center justify-center bg-white">
              <img 
                src="/logo.png" 
                alt="Astros Kulture Logo" 
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = '<div class="w-6 h-6 bg-slate-900 rounded-full"></div>';
                }}
              />
            </div>
            <h1 className="text-sm font-bold text-slate-900">Admin</h1>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              title="Toggle menu"
            >
              {isSidebarOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm sm:text-base"
              title="Logout"
            >
              <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              {/* Circular Logo for Sidebar */}
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-900 flex items-center justify-center bg-white">
                <img 
                  src="/logo.png" 
                  alt="Astros Kulture Logo" 
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '<div class="w-8 h-8 bg-slate-900 rounded-full"></div>';
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Astros Kulture</h1>
                <p className="text-sm text-slate-600 mt-1">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = isNavActive(item);
              return (
                <button
                  key={item.target}
                  onClick={() => handleNavClick(item.target)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full text-left ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer with User Info and Logout */}
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center space-x-3 mb-3">
              {/* Circular user avatar area */}
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                <Users className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{admin?.fullName || 'Admin User'}</p>
                <p className="text-xs text-slate-600">{admin?.email || 'admin@astrokulture.com'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:pl-64 pt-16 lg:pt-0">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}