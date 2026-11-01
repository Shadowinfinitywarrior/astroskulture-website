import { ReactNode, useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { LogOut, Package, ShoppingCart, Users, Home, Menu, X, Grid3x3, Image as ImageIcon, BookOpen, BarChart3, Settings, Palette } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function AdminLayout({ children, currentPage, onNavigate }: AdminLayoutProps) {
  const { admin, logout } = useAdminAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on escape key for keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  const navigation = [
    { name: 'Dashboard', icon: Home, page: 'dashboard', target: 'admin-dashboard' },
    { name: 'Products', icon: Package, page: 'products', target: 'admin-products' },
    { name: 'Orders', icon: ShoppingCart, page: 'orders', target: 'admin-orders' },
    { name: 'Users', icon: Users, page: 'users', target: 'admin-users' },
    { name: 'Categories', icon: Grid3x3, page: 'categories', target: 'admin-categories' },
    { name: 'Banners', icon: ImageIcon, page: 'banners', target: 'admin-banners' },
    { name: 'Blogs', icon: BookOpen, page: 'blogs', target: 'admin-blogs' },
    { name: 'Analytics', icon: BarChart3, page: 'analytics', target: 'admin-analytics' },
    { name: 'Custom Designs', icon: Palette, page: 'custom-designs', target: 'admin-custom-designs' },
    { name: 'Settings', icon: Settings, page: 'settings', target: 'admin-settings' },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleNavClick = (target: string) => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
    
    if (typeof onNavigate === 'function') {
      onNavigate(target);
    } else {
      const route = target.replace('admin-', '/admin/');
      window.location.href = route;
    }
  };

  const isNavActive = (navItem: typeof navigation[0]) => {
    return currentPage === navItem.page || currentPage === navItem.target;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Mobile Top Header - Always visible with prominent Sign Out */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-30 shadow-xs h-14 flex items-center justify-between px-3 sm:px-4">
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-slate-900 focus:outline-none"
            aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isSidebarOpen}
          >
            {isSidebarOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-300 flex items-center justify-center bg-white shadow-xs">
              <img 
                src="/logo.png" 
                alt="Astros Kulture Logo" 
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = '<div class="w-5 h-5 bg-slate-900 rounded-full"></div>';
                }}
              />
            </div>
            <span className="text-sm font-black tracking-tight text-slate-900">Admin Panel</span>
          </div>
        </div>

        {/* Prominent Mobile Sign Out Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/80 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-xs focus-visible:ring-2 focus-visible:ring-red-500 focus:outline-none"
          title="Sign Out of Admin"
          aria-label="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Accessible Sidebar with Custom Scrollbar */}
      <aside
        aria-label="Admin Navigation Sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Sidebar Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between flex-shrink-0 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-900 flex items-center justify-center bg-white shadow-xs flex-shrink-0">
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
                <h1 className="text-base font-black text-slate-900 leading-tight">Astros Kulture</h1>
                <p className="text-xs font-medium text-slate-500">Admin Control Panel</p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-slate-900 focus:outline-none"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Navigation Area with Visible Accessible Scrollbar */}
          <nav 
            aria-label="Admin navigation links"
            className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-1.5 admin-sidebar-scroll focus:outline-none"
            tabIndex={0}
          >
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = isNavActive(item);
              return (
                <button
                  key={item.target}
                  onClick={() => handleNavClick(item.target)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all w-full text-left text-sm font-semibold focus-visible:ring-2 focus-visible:ring-slate-900 focus:outline-none ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Sticky Sidebar Footer - Guaranteed Visible Sign Out & Admin Profile */}
          <div className="p-4 border-t border-slate-200 flex-shrink-0 bg-white sticky bottom-0 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
            <div className="flex items-center space-x-2.5 mb-3 px-1">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                {(admin?.fullName || admin?.username || 'A')[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{admin?.fullName || admin?.username || 'Admin'}</p>
                <p className="text-[11px] text-slate-500 truncate">{admin?.email || 'admin@astroskulture.in'}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-red-500 focus:outline-none"
              aria-label="Sign Out of Admin Account"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <div className="lg:pl-64 pt-14 lg:pt-0 flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-3 sm:p-5 lg:p-8 max-w-7xl w-full mx-auto" role="main">
          {children}
        </main>
      </div>

      {/* Custom Accessible Scrollbar Styles */}
      <style>{`
        .admin-sidebar-scroll {
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
        .admin-sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .admin-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .admin-sidebar-scroll::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 9999px;
        }
        .admin-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}</style>
    </div>
  );
}
