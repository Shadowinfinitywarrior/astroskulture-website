import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff, Play } from 'lucide-react';
import { apiService } from '../../lib/mongodb';

interface Banner {
  _id: string;
  discountPercentage: number;
  textColor?: string;
  backgroundColor?: string;
  displayOrder: number;
  isActive: boolean;
  animationType?: 'slide' | 'fade' | 'bounce' | 'none';
  animationSpeed?: 'slow' | 'normal' | 'fast';
}

interface AdminBannersPageProps {
  onNavigate: (page: string) => void;
}

export default function AdminBannersPage({ onNavigate }: AdminBannersPageProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: 'New Banner',
    displayText: 'Special Offer',
    discountPercentage: 10,
    textColor: '#ffffff',
    backgroundColor: '#dc2626',
    displayOrder: 0,
    isActive: true,
    animationType: 'slide' as const,
    animationSpeed: 'normal' as const,
    description: '',
    link: '',
    imageUrl: ''
  });
  const [animationPreview, setAnimationPreview] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const response = await apiService.adminGetAllBanners();
      
      if (response.success) {
        setBanners(response.data || []);
      } else {
        setError('Failed to load banners');
      }
    } catch (err) {
      setError('Error loading banners');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleEdit = (banner: Banner) => {
    setFormData({
      title: (banner as any).title || 'Banner',
      displayText: (banner as any).displayText || 'Special Offer',
      discountPercentage: banner.discountPercentage,
      textColor: banner.textColor || '#ffffff',
      backgroundColor: banner.backgroundColor || '#dc2626',
      displayOrder: banner.displayOrder,
      isActive: banner.isActive,
      animationType: (banner.animationType || 'slide') as const,
      animationSpeed: (banner.animationSpeed || 'normal') as const,
      description: (banner as any).description || '',
      link: (banner as any).link || '',
      imageUrl: (banner as any).imageUrl || ''
    });
    setEditingId(banner._id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      if (formData.discountPercentage < 1 || formData.discountPercentage > 100) {
        setError('Discount percentage must be between 1 and 100');
        return;
      }

      if (editingId) {
        // Update banner
        const response = await apiService.adminUpdateBanner(editingId, formData);
        if (response.success) {
          setSuccess('Banner updated successfully!');
          setEditingId(null);
        } else {
          setError(response.message || 'Failed to update banner');
        }
      } else {
        // Create new banner
        const response = await apiService.adminCreateBanner(formData);
        if (response.success) {
          setSuccess('Banner created successfully!');
        } else {
          setError(response.message || 'Failed to create banner');
        }
      }

      setFormData({
        title: 'New Banner',
        displayText: 'Special Offer',
        discountPercentage: 10,
        textColor: '#ffffff',
        backgroundColor: '#dc2626',
        displayOrder: 0,
        isActive: true,
        animationType: 'slide',
        animationSpeed: 'normal',
        description: '',
        link: '',
        imageUrl: ''
      });
      setShowForm(false);
      loadBanners();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving banner');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      setError('');
      const response = await apiService.adminDeleteBanner(id);
      
      if (response.success) {
        setSuccess('Banner deleted successfully!');
        loadBanners();
      } else {
        setError(response.message || 'Failed to delete banner');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting banner');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setAnimationPreview(false);
    setFormData({
      title: 'New Banner',
      displayText: 'Special Offer',
      discountPercentage: 10,
      textColor: '#ffffff',
      backgroundColor: '#dc2626',
      displayOrder: 0,
      isActive: true,
      animationType: 'slide',
      animationSpeed: 'normal',
      description: '',
      link: '',
      imageUrl: ''
    });
    setError('');
  };

  const getAnimationClass = (type: string, speed: string) => {
    switch (type) {
      case 'slide':
        return `animate-slide-${speed}`;
      case 'fade':
        return `animate-fade-${speed}`;
      case 'bounce':
        return `animate-bounce-${speed}`;
      default:
        return '';
    }
  };

  return (
    <AdminLayout currentPage="banners" onNavigate={onNavigate}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Banner Management</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Banner
          </button>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
            {success}
          </div>
        )}

        {/* Form Modal - Mobile Responsive */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white rounded-t-lg sm:rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                {editingId ? 'Edit Banner' : 'New Banner'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={(formData as any).title}
                    onChange={handleInputChange}
                    placeholder="Banner title"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Display Text *
                  </label>
                  <input
                    type="text"
                    name="displayText"
                    value={(formData as any).displayText}
                    onChange={handleInputChange}
                    placeholder="Text to display on banner"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Discount Percentage (%) *
                  </label>
                  <input
                    type="number"
                    name="discountPercentage"
                    value={formData.discountPercentage}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Background Color
                  </label>
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <input
                      type="color"
                      name="backgroundColor"
                      value={formData.backgroundColor}
                      onChange={handleInputChange}
                      className="w-full sm:w-16 h-10 border border-slate-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.backgroundColor}
                      readOnly
                      className="flex-1 px-3 sm:px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Text Color
                  </label>
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <input
                      type="color"
                      name="textColor"
                      value={formData.textColor}
                      onChange={handleInputChange}
                      className="w-full sm:w-16 h-10 border border-slate-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.textColor}
                      readOnly
                      className="flex-1 px-3 sm:px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Animation Type
                  </label>
                  <select
                    name="animationType"
                    value={formData.animationType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                  >
                    <option value="none">None</option>
                    <option value="slide">Slide Left/Right</option>
                    <option value="fade">Fade In/Out</option>
                    <option value="bounce">Bounce</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Animation Speed
                  </label>
                  <select
                    name="animationSpeed"
                    value={formData.animationSpeed}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                  >
                    <option value="slow">Slow (3s)</option>
                    <option value="normal">Normal (2s)</option>
                    <option value="fast">Fast (1s)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-slate-700">Active</span>
                </label>
              </div>

              {/* Preview */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Preview</label>
                  <button
                    type="button"
                    onClick={() => setAnimationPreview(!animationPreview)}
                    className="flex items-center gap-2 text-sm bg-slate-500 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    {animationPreview ? 'Stop' : 'Play'} Animation
                  </button>
                </div>
                <div 
                  className={`p-4 rounded-lg overflow-hidden ${animationPreview && formData.animationType !== 'none' ? getAnimationClass(formData.animationType, formData.animationSpeed) : ''}`}
                  style={{ backgroundColor: formData.backgroundColor }}
                >
                  <p
                    className="text-center font-bold text-sm md:text-base"
                    style={{ color: formData.textColor }}
                  >
                    ✨ Special Offer: Get {formData.discountPercentage}% OFF on your order today!
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-slate-900 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors w-full sm:w-auto"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center justify-center gap-2 bg-slate-200 text-slate-900 px-4 sm:px-6 py-2 rounded-lg hover:bg-slate-300 transition-colors w-full sm:w-auto"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </form>
            </div>
          </div>
        )}

        {/* Banners List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        ) : banners.length === 0 ? (
          <div className="bg-slate-50 rounded-lg p-12 text-center">
            <p className="text-slate-600 mb-4">No banners found</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Create First Banner
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {banners
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((banner) => (
                <div
                  key={banner._id}
                  className="bg-white rounded-lg shadow-md p-6 border border-slate-200"
                  style={{ borderLeftColor: banner.backgroundColor || '#dc2626', borderLeftWidth: '4px' }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div
                        className="p-4 rounded text-center font-bold text-sm md:text-base mb-3"
                        style={{
                          backgroundColor: banner.backgroundColor || '#dc2626',
                          color: banner.textColor || '#ffffff'
                        }}
                      >
                        ✨ Special Offer: Get {banner.discountPercentage}% OFF on your order today!
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Discount:</span>
                          <p className="font-semibold text-slate-900">{banner.discountPercentage}%</p>
                        </div>
                        <div>
                          <span className="text-slate-600">Order:</span>
                          <p className="font-semibold text-slate-900">{banner.displayOrder}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">Animation:</span>
                          <p className="font-semibold text-slate-900 capitalize">{banner.animationType || 'None'}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">Status:</span>
                          <p className="font-semibold flex items-center gap-1">
                            {banner.isActive ? (
                              <>
                                <Eye className="w-4 h-4" />
                                <span className="text-green-600">Active</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-4 h-4" />
                                <span className="text-slate-600">Inactive</span>
                              </>
                            )}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-600">Colors:</span>
                          <div className="flex gap-2">
                            <div
                              className="w-5 h-5 rounded border border-slate-300"
                              style={{ backgroundColor: banner.backgroundColor || '#dc2626' }}
                              title="Background"
                            />
                            <div
                              className="w-5 h-5 rounded border border-slate-300"
                              style={{ backgroundColor: banner.textColor || '#ffffff' }}
                              title="Text"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-col">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(banner._id)}
                        className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors text-sm whitespace-nowrap"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}