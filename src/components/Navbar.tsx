import { useState, useEffect } from 'react';
import { ShoppingCart, User, Menu, X, Search, Heart, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [activeBanners, setActiveBanners] = useState<string[]>([]);
  const { user, isAdmin, signOut } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  useEffect(() => {
    // 1. Fetch settings announcement text
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data?.data?.announcementText && data.data.announcementText.trim()) {
          setAnnouncementText(data.data.announcementText.trim());
        } else {
          setAnnouncementText('');
        }
      })
      .catch(() => {});

    // 2. Fetch active dynamic banners created in Admin > Banners
    fetch('/api/banners')
      .then(res => res.json())
      .then(data => {
        if (data?.data && Array.isArray(data.data)) {
          const texts = data.data
            .filter((b: any) => b.isActive && b.displayText && b.displayText.trim())
            .map((b: any) => b.displayText.trim());
          setActiveBanners(texts);
        }
      })
      .catch(() => {});
  }, []);

  // Collect ONLY admin-controlled banner items (strictly no hardcoded banners)
  const bannerList: string[] = [];
  if (activeBanners.length > 0) {
    activeBanners.forEach(b => {
      if (!bannerList.includes(b)) bannerList.push(b);
    });
  }
  if (announcementText && !bannerList.includes(announcementText)) {
    bannerList.push(announcementText);
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      onNavigate('home');
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleUserMenuClick = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleNavigation = (page: string) => {
    onNavigate(page);
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top Banner Above Header (Strictly Admin-Controlled, No Hardcoded Banners) */}
      {bannerList.length > 0 && (
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white text-[11px] sm:text-xs font-bold py-1.5 sm:py-2 overflow-hidden border-b border-red-800/40 select-none shadow-sm">
          <div className="flex w-fit whitespace-nowrap animate-marquee hover:[animation-play-state:paused]">
            <div className="flex items-center gap-6 sm:gap-8 px-4 tracking-wider">
              {(bannerList.length < 3 ? [...bannerList, ...bannerList, ...bannerList] : bannerList).map((text, idx) => (
                <span key={idx} className="flex items-center gap-6 sm:gap-8">
                  <span>{text}</span>
                  <span className="opacity-60">•</span>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-6 sm:gap-8 px-4 tracking-wider" aria-hidden="true">
              {(bannerList.length < 3 ? [...bannerList, ...bannerList, ...bannerList] : bannerList).map((text, idx) => (
                <span key={`dup-${idx}`} className="flex items-center gap-6 sm:gap-8">
                  <span>{text}</span>
                  <span className="opacity-60">•</span>
                </span>
              ))}
            </div>
          </div>
          <style>{`
            @keyframes marquee-scroll {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              animation: marquee-scroll 22s linear infinite;
            }
          `}</style>
        </div>
      )}

      <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-16 md:h-18">
          {/* Left section: Mobile Menu Hamburger & Brand Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            {/* Mobile Menu Button - defined on the Left */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              title="Menu"
              aria-label="Toggle mobile menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
            </button>

            {/* Logo */}
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation('home');
              }}
              className="flex items-center gap-2 sm:gap-2.5 group min-w-0"
              aria-label="Astros Kulture Home"
            >
              {/* Circular Logo - Enlarged for high visibility */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full overflow-hidden border-2 border-red-600 flex items-center justify-center bg-white flex-shrink-0 shadow-sm">
                <picture>
                  <source srcSet="/logo.webp" type="image/webp" />
                  <img 
                    src="/logo.png" 
                    alt="Astros Kulture Logo" 
                    className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 object-contain"
                    width={36}
                    height={36}
                  />
                </picture>
              </div>
              <span className="text-sm sm:text-base md:text-lg font-black tracking-tight text-gray-950 group-hover:text-red-600 transition-colors truncate">
                ASTROS KULTURE
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation('home');
              }}
              className={`font-medium transition-colors ${
                currentPage === 'home'
                  ? 'text-red-600'
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Home
            </a>
            <a
              href="/shop"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation('shop');
              }}
              className={`font-medium transition-colors ${
                currentPage === 'shop'
                  ? 'text-red-600'
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Shop
            </a>
            <a
              href="/blog"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation('blog');
              }}
              className={`font-medium transition-colors ${
                currentPage === 'blog' || currentPage === 'blog-detail'
                  ? 'text-red-600'
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Blog
            </a>
            <a
              href="/categories"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation('categories');
              }}
              className={`font-medium transition-colors ${
                currentPage === 'categories'
                  ? 'text-red-600'
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Categories
            </a>
            <a
              href="/custom-design"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation('custom-design');
              }}
              className={`font-medium transition-colors ${
                currentPage === 'custom-design'
                  ? 'text-red-600'
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Custom Design
            </a>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-0.5 sm:gap-2">
            {/* Search */}
            <button 
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Search"
              aria-label="Search products"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            </button>

            {/* Wishlist */}
            {user && (
              <a
                href="/wishlist"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation('wishlist');
                }}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors relative block"
                title="Wishlist"
                aria-label="View Wishlist"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-medium text-xs">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </a>
            )}

            {/* Cart */}
            <a
              href="/cart"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation('cart');
              }}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors relative block"
              title="Shopping Cart"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-medium text-xs">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </a>

            {/* User Menu */}
            <div className="relative">
              <button 
                onClick={handleUserMenuClick}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center relative"
                title="User Menu"
                aria-label="User Account Menu"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                {user && (
                  <span className="absolute bottom-1 right-1 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-200">
                  {user ? (
                    <>
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {user.fullName || user.email}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      
                      {/* Menu Items */}
                      <button
                        onClick={() => handleNavigation('account')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                      >
                        My Account
                      </button>
                      <button
                        onClick={() => handleNavigation('orders')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                      >
                        My Orders
                      </button>
                      <button
                        onClick={() => handleNavigation('custom-design')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                      >
                        My Custom Designs
                      </button>
                      <button
                        onClick={() => handleNavigation('wishlist')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium flex items-center justify-between"
                      >
                        <span>My Wishlist</span>
                        {wishlistCount > 0 && (
                          <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full min-w-6 text-center font-bold">
                            {wishlistCount}
                          </span>
                        )}
                      </button>
                      
                      {/* Admin Section */}
                      {isAdmin && (
                        <>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={() => handleNavigation('admin-dashboard')}
                            className="block w-full text-left px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors font-semibold"
                          >
                            Admin Dashboard
                          </button>
                        </>
                      )}
                      
                      {/* Sign Out */}
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center font-bold"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Guest Menu */}
                      <button
                        onClick={() => handleNavigation('login')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => handleNavigation('register')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Create Account
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Left Slide-In) */}
      <div
        className={`fixed inset-0 z-[100] md:hidden transition-all duration-300 ${
          isMenuOpen ? 'pointer-events-auto opacity-100 visible' : 'pointer-events-none opacity-0 invisible'
        }`}
      >
        {/* Backdrop Overlay */}
        <div
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />

        {/* Drawer Panel (Left Swipe-in) */}
        <div
          className={`fixed inset-y-0 left-0 w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-[101] transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Astros Kulture" className="w-9 h-9 object-contain rounded-full border-2 border-red-600 shadow-sm" />
              <span className="font-black text-base tracking-wide text-gray-950">ASTROS KULTURE</span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 rounded-full transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Status Banner at Top of Mobile Drawer */}
          {user ? (
            <div className="p-3.5 bg-red-50/70 border-b border-red-100 flex items-center justify-between">
              <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                  {(user.fullName || user.email || 'U')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{user.fullName || user.email}</p>
                  <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleSignOut();
                }}
                className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs flex-shrink-0 active:scale-95"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">Welcome to Astros</span>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleNavigation('login');
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs active:scale-95"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Drawer Navigation Links */}
          <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(false);
                handleNavigation('home');
              }}
              className="block w-full text-left px-3 py-2.5 text-sm text-gray-800 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors font-medium"
            >
              Home
            </a>
            <a
              href="/shop"
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(false);
                handleNavigation('shop');
              }}
              className="block w-full text-left px-3 py-2.5 text-sm text-gray-800 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors font-medium"
            >
              Shop All
            </a>
            <a
              href="/categories"
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(false);
                handleNavigation('categories');
              }}
              className="block w-full text-left px-3 py-2.5 text-sm text-gray-800 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors font-medium"
            >
              Categories
            </a>
            <a
              href="/custom-design"
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(false);
                handleNavigation('custom-design');
              }}
              className="block w-full text-left px-3 py-2.5 text-sm text-gray-800 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors font-medium"
            >
              Custom Design Hub
            </a>
            <a
              href="/blog"
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(false);
                handleNavigation('blog');
              }}
              className="block w-full text-left px-3 py-2.5 text-sm text-gray-800 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors font-medium"
            >
              Blog & Stories
            </a>

            {/* User-specific mobile menu items */}
            {user ? (
              <>
                <div className="border-t border-gray-200 my-3 pt-2">
                  <span className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</span>
                </div>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleNavigation('account');
                  }}
                  className="block w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleNavigation('orders');
                  }}
                  className="block w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  My Orders
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleNavigation('wishlist');
                  }}
                  className="block w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium flex items-center justify-between"
                >
                  <span>My Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">
                      {wishlistCount}
                    </span>
                  )}
                </button>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleNavigation('admin-dashboard');
                    }}
                    className="block w-full text-left px-3 py-2.5 text-sm text-purple-700 hover:bg-purple-50 rounded-lg transition-colors font-medium"
                  >
                    Admin Dashboard
                  </button>
                )}
                <div className="border-t border-gray-200 my-3"></div>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-bold flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-gray-200 my-3 pt-2">
                  <span className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</span>
                </div>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleNavigation('login');
                  }}
                  className="block w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleNavigation('register');
                  }}
                  className="block w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  Create Account
                </button>
              </>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
            <p className="font-semibold text-gray-700">ASTROS KULTURE</p>
            <p className="mt-0.5">Heavyweight 240 GSM Streetwear India</p>
          </div>
        </div>
      </div>

      {/* Overlay to close user menu when clicking outside - only for desktop user menu */}
      {isUserMenuOpen && !isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => {
            setIsUserMenuOpen(false);
          }}
        />
      )}
    </nav>
  </header>
  );
}