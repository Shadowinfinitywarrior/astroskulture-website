import { useState, useEffect } from 'react';
import { apiService } from '../../lib/mongodb';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import AdminLayout from '../../components/admin/AdminLayout';

interface Settings {
  gstPercentage: number;
  gstEnabled: boolean;
  shippingFee: number;
  shippingEnabled: boolean;
  freeShippingAbove: number;
}

// Add confirmation modal state
export default function AdminSettingsPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetOptions, setResetOptions] = useState({
    products: false,
    orders: false,
    users: false,
    reviews: false,
    all: false
  });
  const [settings, setSettings] = useState < Settings > ({
    gstPercentage: 18,
    gstEnabled: true,
    shippingFee: 0,
    shippingEnabled: true,
    freeShippingAbove: 999,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await apiService.getSettings();
      if (result.success) {
        setSettings(result.data);
      } else {
        throw new Error(result.message || 'Failed to load settings');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load settings';
      setError(errorMessage);
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const inputElement = e.target as HTMLInputElement;

    // Enhanced number handling to allow 0 and empty strings
    if (type === 'number') {
      const numValue = value === '' ? 0 : parseFloat(value);
      setSettings(prev => ({
        ...prev,
        [name]: numValue
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? inputElement.checked : value
      }));
    }
  };

  const handleResetOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name === 'all') {
      setResetOptions({
        products: checked,
        orders: checked,
        users: checked,
        reviews: checked,
        all: checked
      });
    } else {
      setResetOptions(prev => ({
        ...prev,
        [name]: checked,
        all: checked && prev.products && prev.orders && prev.users && prev.reviews // rough logic
      }));
    }
  };

  const handleMasterReset = async () => {
    if (!resetOptions.products && !resetOptions.orders && !resetOptions.users && !resetOptions.reviews) {
      setError('Please select at least one item to reset');
      return;
    }

    if (!confirm('WARNING: This will PERMANENTLY DELETE the selected data. This action cannot be undone. Are you sure?')) {
      return;
    }

    try {
      setSaving(true);
      // Logic for Master Reset - implementing mocked call or real if backend updated
      // Assuming apiService.masterReset exists or we call a direct endpoint
      const result = await apiService.request('/admin/reset-db', {
        method: 'POST',
        body: JSON.stringify(resetOptions)
      }, true);

      if (result.success) {
        setSuccess('Data reset successfully');
        setShowResetModal(false);
        // Maybe logout if users deleted?
        if (resetOptions.users || resetOptions.all) {
          setTimeout(() => onNavigate('login'), 2000);
        }
      } else {
        throw new Error(result.message || 'Reset failed');
      }
    } catch (err) {
      setError('Failed to reset data: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const result = await apiService.updateSettings(settings);
      if (result.success) {
        setSuccess('Settings updated successfully!');
        // Reload settings from server to ensure UI is in sync
        await loadSettings();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(result.message || 'Failed to update settings');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
      console.error('Error updating settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <AdminLayout currentPage="settings" onNavigate={onNavigate}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
          <p className="text-gray-600 mt-2">Manage GST and Shipping Fee settings</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
          {/* GST Section */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">GST Settings</h2>

            <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="gstEnabled"
                name="gstEnabled"
                checked={settings.gstEnabled}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="gstEnabled" className="ml-3 text-sm font-medium text-gray-700">
                Enable GST
              </label>
            </div>

            {settings.gstEnabled && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="gstPercentage" className="block text-sm font-medium text-gray-700 mb-2">
                    GST Percentage (%)
                  </label>
                  <input
                    type="number"
                    id="gstPercentage"
                    name="gstPercentage"
                    value={settings.gstPercentage}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter value between 0 and 100</p>
                </div>
              </div>
            )}
          </div>

          {/* Shipping Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Settings</h2>

            <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="shippingEnabled"
                name="shippingEnabled"
                checked={settings.shippingEnabled}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="shippingEnabled" className="ml-3 text-sm font-medium text-gray-700">
                Enable Shipping Fee
              </label>
            </div>

            {settings.shippingEnabled && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="shippingFee" className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Fee (₹)
                  </label>
                  <input
                    type="number"
                    id="shippingFee"
                    name="shippingFee"
                    value={settings.shippingFee}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter shipping fee in rupees</p>
                </div>

                <div>
                  <label htmlFor="freeShippingAbove" className="block text-sm font-medium text-gray-700 mb-2">
                    Free Shipping Above (₹)
                  </label>
                  <input
                    type="number"
                    id="freeShippingAbove"
                    name="freeShippingAbove"
                    value={settings.freeShippingAbove}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Orders above this amount will have free shipping</p>
                </div>
              </div>
            )}
          </div>

          {/* Dangerous Zone - Master Reset */}
          <div className="mb-8 border-t border-red-200 pt-8 mt-12">
            <h2 className="text-xl font-bold text-red-600 mb-2">Dangerous Zone</h2>
            <p className="text-gray-600 mb-4">Actions here can cause permanent data loss. Use with extreme caution.</p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="font-semibold text-red-900 mb-4">Master Data Reset</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" name="all" checked={resetOptions.all} onChange={handleResetOptionChange} className="rounded text-red-600 focus:ring-red-500" />
                  <span className="text-sm font-medium text-gray-700">Select All</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" name="orders" checked={resetOptions.orders} onChange={handleResetOptionChange} className="rounded text-red-600 focus:ring-red-500" />
                  <span className="text-sm text-gray-700">Orders & Revenue</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" name="users" checked={resetOptions.users} onChange={handleResetOptionChange} className="rounded text-red-600 focus:ring-red-500" />
                  <span className="text-sm text-gray-700">Users & Accounts</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" name="products" checked={resetOptions.products} onChange={handleResetOptionChange} className="rounded text-red-600 focus:ring-red-500" />
                  <span className="text-sm text-gray-700">Products & Images</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" name="reviews" checked={resetOptions.reviews} onChange={handleResetOptionChange} className="rounded text-red-600 focus:ring-red-500" />
                  <span className="text-sm text-gray-700">Reviews</span>
                </label>
              </div>
              <button
                type="button"
                onClick={handleMasterReset}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Clear Selected Data
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3">Current Settings Summary</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>
                <strong>GST:</strong> {settings.gstEnabled ? `${settings.gstPercentage}%` : 'Disabled'}
              </li>
              <li>
                <strong>Shipping Fee:</strong> {settings.shippingEnabled ? `₹${settings.shippingFee}` : 'Disabled'}
              </li>
              {settings.shippingEnabled && (
                <li>
                  <strong>Free Shipping Above:</strong> ₹{settings.freeShippingAbove}
                </li>
              )}
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {saving ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Save Settings'
              )}
            </button>
            <button
              type="button"
              onClick={loadSettings}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
