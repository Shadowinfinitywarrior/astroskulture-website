import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UserData {
  _id: string;
  email: string;
  fullName: string;
  phone?: string;
  addresses: Array<{
    _id?: string;
    fullName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }>;
}

const UserAccountPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { user: authUser, updateProfile } = useAuth();
  const [user, setUser] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setUser(result.data);
        setFormData({
          fullName: result.data.fullName || '',
          email: result.data.email || '',
          phone: result.data.phone || ''
        });
      } else {
        // If API fails, use auth context user data
        if (authUser) {
          setUser({
            _id: authUser._id || '',
            email: authUser.email,
            fullName: authUser.fullName || '',
            phone: authUser.phone || '',
            addresses: authUser.addresses || []
          });
          setFormData({
            fullName: authUser.fullName || '',
            email: authUser.email,
            phone: authUser.phone || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to auth context user data
      if (authUser) {
        setUser({
          _id: authUser._id || '',
          email: authUser.email,
          fullName: authUser.fullName || '',
          phone: authUser.phone || '',
          addresses: authUser.addresses || []
        });
        setFormData({
          fullName: authUser.fullName || '',
          email: authUser.email,
          phone: authUser.phone || ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setIsEditing(false);
      alert('Profile updated successfully!');
      // Refresh user data
      fetchUserProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;
  if (!user) return <div className="container mx-auto px-4 py-8">Please sign in to view your account</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Profile Information</h2>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="font-semibold text-gray-700">Full Name:</label>
                  <p className="mt-1">{user.fullName}</p>
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Email:</label>
                  <p className="mt-1">{user.email}</p>
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Phone:</label>
                  <p className="mt-1">{user.phone || 'Not provided'}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Full Name:</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Email:</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Phone:</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit" 
                    className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
                  >
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        fullName: user.fullName || '',
                        email: user.email || '',
                        phone: user.phone || ''
                      });
                    }}
                    className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => onNavigate('orders')}
                className="block w-full text-left bg-blue-50 text-blue-700 px-4 py-3 rounded hover:bg-blue-100 transition-colors"
              >
                📦 View My Orders
              </button>
              <button className="block w-full text-left bg-green-50 text-green-700 px-4 py-3 rounded hover:bg-green-100 transition-colors">
                ❤️ My Wishlist
              </button>
              <button className="block w-full text-left bg-purple-50 text-purple-700 px-4 py-3 rounded hover:bg-purple-100 transition-colors">
                ⭐ My Reviews
              </button>
            </div>
          </div>

          {/* Account Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Account Overview</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Member since:</span>
                <span className="font-semibold">2024</span>
              </div>
              <div className="flex justify-between">
                <span>Total orders:</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span>Default address:</span>
                <span className="font-semibold">
                  {user.addresses?.find(addr => addr.isDefault) ? 'Set' : 'Not set'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccountPage;