import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Admin {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

interface AdminAuthContextType {
  admin: Admin | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  // FIXED: Use environment variable with fallback
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.PROD 
      ? 'https://astroskulture.in/api' 
      : 'http://localhost:5000/api'
    );
  const API_URL = API_BASE_URL;

  console.log('🔐 AdminAuth API URL:', API_URL);
  console.log('🔐 AdminAuth Environment:', import.meta.env.PROD ? 'production' : 'development');

  // Check for existing admin session on mount
  useEffect(() => {
    const checkAdminSession = async () => {
      const token = localStorage.getItem('adminToken');
      const savedAdmin = localStorage.getItem('admin');
      
      if (token && savedAdmin) {
        try {
          // Verify the token by decoding and checking expiration
          const payload = JSON.parse(atob(token.split('.')[1]));
          const isExpired = payload.exp * 1000 < Date.now();
          
          if (isExpired) {
            console.log('🔐 Token expired, clearing storage');
            clearAdminStorage();
          } else {
            // Token is valid, restore admin data
            const adminData = JSON.parse(savedAdmin);
            setAdmin(adminData);
            console.log('🔐 Admin session restored from localStorage');
          }
        } catch (error) {
          console.error('🔐 Token validation failed:', error);
          clearAdminStorage();
        }
      } else {
        // No token found, ensure clean state
        clearAdminStorage();
      }
      setLoading(false);
    };

    checkAdminSession();
  }, []);

  const clearAdminStorage = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    setAdmin(null);
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      console.log('🔐 Attempting admin login with:', { username, password: '***' });
      console.log('🔐 Using API URL:', `${API_URL}/auth/admin/login`);
      
      const response = await fetch(`${API_URL}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('🔐 Admin login response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      if (data.success && data.token && data.admin) {
        // Store the token and admin data
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('admin', JSON.stringify(data.admin));
        setAdmin(data.admin);
        
        console.log('🔐 Admin login successful:', data.admin.username);
      } else {
        throw new Error(data.message || 'Admin login failed - no token or admin data received');
      }
    } catch (error) {
      console.error('🔐 Admin login error:', error);
      clearAdminStorage();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAdminStorage();
    console.log('🔐 Admin logged out');
  };

  const isAuthenticated = !!admin && !!localStorage.getItem('adminToken');

  return (
    <AdminAuthContext.Provider value={{ 
      admin, 
      loading, 
      login, 
      logout, 
      isAuthenticated 
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}