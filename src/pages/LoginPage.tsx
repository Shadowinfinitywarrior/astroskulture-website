import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getFriendlyErrorMessage } from '../utils/errorUtils';

interface LoginPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const [identifier, setIdentifier] = useState(''); // Can be email or username
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { login: adminLogin } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔐 Attempting login with identifier:', identifier);

      // First try admin login with the identifier as username
      try {
        console.log('🔐 Trying admin login...');
        await adminLogin(identifier, password);
        console.log('✅ Admin login successful');
        onNavigate('admin-dashboard');
        return;
      } catch (adminError: any) {
        console.log('🔐 Admin login failed:', adminError.message);
        // Continue to user login
      }

      // Try regular user login with the identifier as email
      console.log('🔐 Trying user login...');
      const result = await signIn(identifier, password);
      console.log('✅ User login successful, role:', result.role);

      // Check if user is actually an admin but used the wrong login method
      if (result.role === 'admin') {
        console.log('🔐 User has admin role, redirecting to admin dashboard');
        onNavigate('admin-dashboard');
      } else {
        // Check if user was trying to buy a product
        const returnToProduct = localStorage.getItem('returnToProduct');
        if (returnToProduct) {
          localStorage.removeItem('returnToProduct');
          console.log('🔐 Regular user, redirecting back to product:', returnToProduct);
          onNavigate('product', { slug: returnToProduct });
        } else {
          console.log('🔐 Regular user, redirecting to home');
          onNavigate('home');
        }
      }

    } catch (err: any) {
      console.error('🔐 All login attempts failed:', err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            {/* Circular Logo */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full mb-4 border-2 border-slate-900 overflow-hidden">
              <img
                src="/logo.png"
                alt="Astros Kulture Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-slate-600">Sign in to your Astros Kulture account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-slate-700 mb-2">
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors"
                  placeholder="Enter username or email"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors"
                  placeholder="Enter password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
                disabled={isLoading}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="text-slate-900 font-semibold hover:underline transition-colors"
                disabled={isLoading}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}