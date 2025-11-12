import { useState } from 'react';
import { ShoppingCart, User, Menu, X, Search, Heart } from 'lucide-react';
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
  const { user, isAdmin, signOut } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist(); // Use wishlistCount instead of wishlist.length

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
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <button
            onClick={() => handleNavigation('home')}
            className="flex items-center gap-1 sm:gap-2 group min-w-0"
          >
            {/* Circular Logo */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-red-600 flex items-center justify-center bg-white flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="Astros Kulture Logo" 
                className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
              />
            </div>
            <span className="text-xs sm:text-sm md:text-base font-bold text-gray-900 group-hover:text-red-600 transition-colors truncate">
              ASTROS KULTURE
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavigation('home')}
              className={`font-medium transition-colors ${
                currentPage === 'home'
                  ? 'text-red-600'
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavigation('shop')}
              className={`font-medium transition-colors ${
                currentPage === 'shop'
                  ? 'text-red-600'
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Shop
            </button>
            <button
              onClick={() => handleNavigation('blog')}
              className={`font-medium transition-colors ${
                currentPage === 'blog' || currentPage === 'blog-detail'
                  ? 'text-red-600'
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Blog
            </button>
            <button
              onClick={() => handleNavigation('categories')}
              className={`font-medium transition-colors ${
                currentPage === 'categories'
                  ? 'text-red-600'
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Categories
            </button>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-0.5 sm:gap-2">
            {/* Search */}
            <button 
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            </button>

            {/* Wishlist */}
            {user && (
              <button
                onClick={() => handleNavigation('wishlist')}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                title="Wishlist"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-medium text-xs">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </button>
            )}

            {/* Cart */}
            <button
              onClick={() => handleNavigation('cart')}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors relative"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-medium text-xs">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button 
                onClick={handleUserMenuClick}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center space-x-1"
                title="User Menu"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                  {user ? (
                    <>
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.fullName || user.email}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      
                      {/* Menu Items */}
                      <button
                        onClick={() => handleNavigation('account')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        My Account
                      </button>
                      <button
                        onClick={() => handleNavigation('orders')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        My Orders
                      </button>
                      <button
                        onClick={() => handleNavigation('wishlist')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between"
                      >
                        <span>My Wishlist</span>
                        {wishlistCount > 0 && (
                          <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full min-w-6 text-center">
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
                            className="block w-full text-left px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors"
                          >
                            Admin Dashboard
                          </button>
                        </>
                      )}
                      
                      {/* Sign Out */}
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Sign Out
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              title="Menu"
            >
              {isMenuOpen ? (
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              ) : (
                <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white overflow-y-auto max-h-[calc(100vh-4rem)] shadow-lg">
          <div className="px-3 py-2 space-y-1">
            <button
              onClick={() => handleNavigation('home')}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
            >
              Home
            </button>
            <button
              onClick={() => handleNavigation('shop')}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
            >
              Shop
            </button>
            <button
              onClick={() => handleNavigation('blog')}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
            >
              Blog
            </button>
            <button
              onClick={() => handleNavigation('categories')}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
            >
              Categories
            </button>
            
            {/* User-specific mobile menu items */}
            {user && (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <button
                  onClick={() => handleNavigation('account')}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                >
                  My Account
                </button>
                <button
                  onClick={() => handleNavigation('orders')}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                >
                  My Orders
                </button>
                <button
                  onClick={() => handleNavigation('wishlist')}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium flex items-center justify-between"
                >
                  <span>My Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                      {wishlistCount}
                    </span>
                  )}
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleNavigation('admin-dashboard')}
                    className="block w-full text-left px-3 py-2 text-sm text-purple-700 hover:bg-purple-50 rounded-lg transition-colors font-medium"
                  >
                    Admin Dashboard
                  </button>
                )}
                <div className="border-t border-gray-200 my-2"></div>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  Sign Out
                </button>
              </>
            )}
            
            {/* Guest mobile menu */}
            {!user && (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <button
                  onClick={() => handleNavigation('login')}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavigation('register')}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                >
                  Create Account
                </button>
              </>
            )}
          </div>
        </div>
      )}

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
  );
}