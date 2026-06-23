import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiService } from '../lib/mongodb';
import type { User, Address } from '../lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; role?: string }>;
  signUp: (email: string, password: string, fullName: string, phone?: string, dateOfBirth?: string, securityQuestion?: string, securityAnswer?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  addAddress: (address: Omit<Address, '_id'>) => Promise<void>;
  updateAddress: (addressId: string, address: Partial<Address>) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      // Store token temporarily for the verification request
      localStorage.setItem('token', token);
      
      const data = await apiService.getCurrentUser();
      
      if (data.success) {
        setUser(data.user || data.data); // Handle both response formats
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; role?: string }> => {
    try {
      const data = await apiService.login(email, password);
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        setUser(data.user || data.data); // Handle both response formats
        return { success: true, role: (data.user || data.data)?.role };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      localStorage.removeItem('token');
      // Re-throw the error so LoginPage can catch it
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone?: string, dateOfBirth?: string, securityQuestion?: string, securityAnswer?: string) => {
    try {
      const data = await apiService.register({
        email,
        password,
        fullName,
        phone,
        dateOfBirth,
        securityQuestion,
        securityAnswer
      });
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        setUser(data.user || data.data); // Handle both response formats
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      localStorage.removeItem('token');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const data = await apiService.updateProfile(userData);
      
      if (data.success) {
        setUser(data.data || data.user);
      } else {
        throw new Error(data.message || 'Profile update failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const addAddress = async (address: Omit<Address, '_id'>) => {
    try {
      const data = await apiService.addAddress(address);
      
      if (data.success && user) {
        setUser({
          ...user,
          addresses: data.data
        });
      } else {
        throw new Error(data.message || 'Failed to add address');
      }
    } catch (error) {
      throw error;
    }
  };

  const updateAddress = async (addressId: string, address: Partial<Address>) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/address/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(address)
      });

      const data = await response.json();
      
      if (data.success && user) {
        setUser({
          ...user,
          addresses: data.data
        });
      } else {
        throw new Error(data.message || 'Failed to update address');
      }
    } catch (error) {
      throw error;
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      updateProfile,
      addAddress,
      updateAddress,
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export the context for direct usage if needed
export { AuthContext };