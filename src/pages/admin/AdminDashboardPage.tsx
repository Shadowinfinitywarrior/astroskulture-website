import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Package, ShoppingCart, Users, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
}

interface AdminDashboardPageProps {
  onNavigate: (page: string) => void;
}

export default function AdminDashboardPage({ onNavigate }: AdminDashboardPageProps) {
  const { isAuthenticated, admin, logout } = useAdminAuth();
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminAccess, setAdminAccess] = useState<boolean>(true);

  // FIXED: Use environment-based API URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.PROD 
      ? 'https://astroskulture-website.onrender.com/api' 
      : 'http://localhost:5000/api'
    );

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    } else {
      setLoading(false);
      onNavigate('login');
    }
  }, [isAuthenticated]);

  const fetchStats = async () => {
    const token = localStorage.getItem('adminToken');

    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Fetching dashboard stats with token:', token ? 'Present' : 'Missing');
      console.log('👤 Current admin:', admin);
      console.log('🌍 Using API URL:', API_BASE_URL);
      
      // Debug token
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('📊 Token payload:', payload);
        } catch (e) {
          console.error('📊 Error decoding token:', e);
        }
      }

      // Test admin access first
      const testAccess = await fetch(`${API_BASE_URL}/admin/products`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!testAccess.ok) {
        console.error('🔐 Admin access test failed:', testAccess.status);
        const errorData = await testAccess.json().catch(() => ({}));
        console.error('🔐 Error details:', errorData);
        
        setAdminAccess(false);
        setError(`Admin access denied: ${errorData.message || 'You do not have admin privileges'}`);
        
        // Set default stats since we can't access admin data
        setStats({
          totalProducts: 0,
          totalOrders: 0,
          totalUsers: 0,
          totalRevenue: 0,
        });
        return;
      }

      console.log('✅ Admin access verified');

      const requests = [
        // Public endpoint for products
        fetch(`${API_BASE_URL}/products`).then(res => res.json()),
        
        // Admin endpoints
        fetch(`${API_BASE_URL}/admin/orders`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }).then(res => res.json()),
        
        fetch(`${API_BASE_URL}/admin/users`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }).then(res => res.json())
      ];

      const [productsResult, ordersResult, usersResult] = await Promise.all(requests);

      console.log('📊 Dashboard API responses:', {
        products: productsResult,
        orders: ordersResult,
        users: usersResult
      });

      // Check for API errors
      const errors = [];
      if (!productsResult.success) errors.push('products');
      if (!ordersResult.success) errors.push('orders');
      if (!usersResult.success) errors.push('users');

      if (errors.length > 0) {
        setError(`Failed to load: ${errors.join(', ')} data`);
      }

      // Extract data from API responses
      const products = productsResult.success ? productsResult.data : [];
      const orders = ordersResult.success ? ordersResult.data : [];
      const users = usersResult.success ? usersResult.data : [];

      // Calculate total revenue from orders
      const totalRevenue = Array.isArray(orders) 
        ? orders.reduce((sum: number, order: any) => sum + (order.totalAmount || order.total || 0), 0)
        : 0;

      setStats({
        totalProducts: Array.isArray(products) ? products.length : 0,
        totalOrders: Array.isArray(orders) ? orders.length : 0,
        totalUsers: Array.isArray(users) ? users.length : 0,
        totalRevenue,
      });

      setAdminAccess(true);

    } catch (error) {
      console.error('📊 Error fetching stats:', error);
      setError('Failed to load dashboard data. Please check your connection.');
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchStats();
  };

  const handleLogout = () => {
    logout();
    onNavigate('login');
  };

  const handleReLogin = () => {
    logout();
    onNavigate('login');
  };

  const handleNavigation = (page: string) => {
    if (!adminAccess && page.startsWith('admin-')) {
      setError('Admin access required for this section');
      return;
    }
    onNavigate(page);
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      target: 'admin-products',
      disabled: !adminAccess,
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
      target: 'admin-orders',
      disabled: !adminAccess,
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-purple-500',
      target: 'admin-users',
      disabled: !adminAccess,
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      target: 'admin-orders',
      disabled: !adminAccess,
    },
  ];

  const quickActions = [
    {
      title: 'Manage Products',
      description: 'Add, edit, or remove products',
      target: 'admin-products',
      icon: Package,
      disabled: !adminAccess,
    },
    {
      title: 'Process Orders',
      description: 'View and update order status',
      target: 'admin-orders',
      icon: ShoppingCart,
      disabled: !adminAccess,
    },
    {
      title: 'Manage Users',
      description: 'View and edit user accounts',
      target: 'admin-users',
      icon: Users,
      disabled: !adminAccess,
    },
  ];

  if (loading) {
    return (
      <AdminLayout currentPage="dashboard" onNavigate={onNavigate}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center space-y-3">
              <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
              <div className="text-lg text-slate-600">Loading dashboard...</div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="dashboard" onNavigate={onNavigate}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            {admin && (
              <p className="text-slate-600 mt-1">
                Welcome back, {admin.fullName || admin.username}
                {!adminAccess && ' (Limited Access)'}
              </p>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRetry}
              disabled={loading}
              className="flex items-center space-x-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <div className={`mb-6 rounded-lg p-4 ${
            adminAccess ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium mb-1">
                  {adminAccess ? 'Limited Access' : 'Access Denied'}
                </div>
                <div className="text-sm">
                  {error}
                </div>
                {!adminAccess && (
                  <div className="mt-2">
                    <button
                      onClick={handleReLogin}
                      className="text-sm underline hover:no-underline"
                    >
                      Re-login with admin account
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <button
                key={stat.title}
                onClick={() => handleNavigation(stat.target)}
                disabled={stat.disabled}
                className={`bg-white rounded-lg shadow p-6 transition-all cursor-pointer text-left w-full ${
                  stat.disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:shadow-lg hover:scale-105'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                {stat.disabled && (
                  <div className="mt-2 text-xs text-slate-500">
                    Admin access required
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action) => {
                const ActionIcon = action.icon;
                return (
                  <button
                    key={action.title}
                    onClick={() => handleNavigation(action.target)}
                    disabled={action.disabled}
                    className={`block w-full text-left px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                      action.disabled
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <ActionIcon className="w-5 h-5" />
                      <div>
                        <p className={`font-medium ${action.disabled ? 'text-slate-400' : 'text-slate-900'}`}>
                          {action.title}
                        </p>
                        <p className="text-sm text-slate-600">{action.description}</p>
                      </div>
                    </div>
                    {action.disabled && (
                      <div className="mt-1 text-xs text-slate-500">
                        Admin access required
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">System Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-slate-600">Platform</span>
                <span className="font-medium text-slate-900">Astros Kulture Admin</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-slate-600">Admin Access</span>
                <span className={`font-medium ${adminAccess ? 'text-green-600' : 'text-red-600'}`}>
                  {adminAccess ? 'Granted' : 'Restricted'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-slate-600">Database</span>
                <span className="font-medium text-slate-900">MongoDB</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-slate-600">Backend</span>
                <span className="font-medium text-slate-900">Node.js + Express</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600">Frontend</span>
                <span className="font-medium text-slate-900">React + TypeScript</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}