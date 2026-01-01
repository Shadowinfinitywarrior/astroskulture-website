import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Edit, Trash2, X, Plus, RefreshCw } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

interface User {
  _id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  createdAt: string;
}

interface AdminUsersPageProps {
  onNavigate: (page: string) => void;
}

export default function AdminUsersPage({ onNavigate }: AdminUsersPageProps) {
  const { isAuthenticated } = useAdminAuth();
  const [users, setUsers] = useState < User[] > ([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState < User | null > (null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState < string | null > (null);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    password: '',
    role: 'customer',
  });

  // FIXED: Use environment-based API URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD
      ? 'https://astroskulture-website.onrender.com/api'
      : 'http://localhost:5000/api'
    );

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchUsers = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      setLoading(true);
      setError(null);

      console.log('👥 Fetching users from:', `${API_BASE_URL}/admin/users`);
      console.log('👥 Token present:', !!token);

      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('👥 Users response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('👥 Users data received:', result.data?.length || 0, 'users');

        if (result.success) {
          setUsers(result.data || []);
        } else {
          console.error('👥 Error in response:', result.message);
          setError(result.message || 'Failed to load users');
          setUsers([]);
        }
      } else {
        const errorText = await response.text();
        console.error('👥 HTTP Error:', response.status, errorText);

        if (response.status === 401) {
          setError('Authentication failed. Please login again.');
          // Token is invalid, clear it
          localStorage.removeItem('adminToken');
          localStorage.removeItem('admin');
          window.location.reload();
        } else {
          setError(`Failed to load users: ${response.status} ${response.statusText}`);
        }
        setUsers([]);
      }
    } catch (error) {
      console.error('👥 Error fetching users:', error);
      setError('Network error: Unable to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    try {
      setError(null);

      const url = editingUser
        ? `${API_BASE_URL}/admin/users/${editingUser._id}`
        : `${API_BASE_URL}/admin/users`;

      const method = editingUser ? 'PUT' : 'POST';

      console.log('💾 Saving user to:', url);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ User saved successfully');
        fetchUsers();
        closeModal();
        alert(editingUser ? 'User updated successfully!' : 'User created successfully!');
      } else {
        console.error('👥 Error saving user:', result.message);
        setError(result.message || 'Failed to save user');
      }
    } catch (error) {
      console.error('👥 Error saving user:', error);
      setError('Network error: Unable to save user');
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      setError(null);

      console.log('🗑️ Deleting user:', id);

      const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ User deleted successfully');
        fetchUsers();
        alert('User deleted successfully!');
      } else {
        console.error('👥 Error deleting user:', result.message);
        setError(result.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('👥 Error deleting user:', error);
      setError('Network error: Unable to delete user');
    }
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        fullName: user.fullName,
        phone: user.phone || '',
        password: '',
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        fullName: '',
        phone: '',
        password: '',
        role: 'customer',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setError(null);
  };

  const handleRetry = () => {
    fetchUsers();
  };

  if (loading) {
    return (
      <AdminLayout currentPage="users" onNavigate={onNavigate}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-slate-600">Loading users...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="users" onNavigate={onNavigate}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
          <div className="flex space-x-3">
            <button
              onClick={handleRetry}
              className="flex items-center space-x-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => openModal()}
              className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-red-800 text-sm">
                {error}
              </div>
              <button
                onClick={handleRetry}
                className="text-red-800 hover:text-red-900 text-sm underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">No users found.</p>
              <button
                onClick={handleRetry}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Retry Loading Users
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {user.fullName || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {user.phone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal(user)}
                        className="text-slate-600 hover:text-slate-900 mr-3 p-1 rounded hover:bg-slate-100 transition-colors"
                        title="Edit user"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingUser ? 'Edit User' : 'Add User'}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-red-800 text-sm">
                  {error}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    required
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  required
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="Enter phone number (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password {editingUser && '(leave blank to keep current)'}
                  {!editingUser && ' *'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  required={!editingUser}
                  placeholder={editingUser ? "Enter new password (optional)" : "Enter password"}
                  minLength={6}
                />
                {!editingUser && (
                  <p className="text-xs text-slate-500 mt-1">Password must be at least 6 characters long</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Admin users have full access to the admin panel
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}