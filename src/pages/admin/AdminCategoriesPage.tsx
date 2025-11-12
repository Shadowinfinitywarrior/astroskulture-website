import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { apiService } from '../../lib/mongodb';

interface Category {
  _id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
}

interface AdminCategoriesPageProps {
  onNavigate: (page: string) => void;
}

export default function AdminCategoriesPage({ onNavigate }: AdminCategoriesPageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    imageUrl: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCategories();
      if (response.success) {
        setCategories(response.data || []);
      } else {
        setError('Failed to load categories');
      }
    } catch (err) {
      setError('Error loading categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'name' && !editingId ? { slug: value.toLowerCase().replace(/\s+/g, '-') } : {})
    }));
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      imageUrl: category.imageUrl || '',
      description: category.description || ''
    });
    setEditingId(category._id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      if (!formData.name || !formData.slug) {
        setError('Name and slug are required');
        return;
      }

      if (editingId) {
        // Update category
        const response = await apiService.adminUpdateCategory(editingId, formData);
        if (response.success) {
          setSuccess('Category updated successfully!');
          setEditingId(null);
        } else {
          setError(response.message || 'Failed to update category');
        }
      } else {
        // Create new category
        const response = await apiService.adminCreateCategory(formData);
        if (response.success) {
          setSuccess('Category created successfully!');
        } else {
          setError(response.message || 'Failed to create category');
        }
      }

      setFormData({ name: '', slug: '', imageUrl: '', description: '' });
      setShowForm(false);
      loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      setError('');
      const response = await apiService.adminDeleteCategory(id);
      
      if (response.success) {
        setSuccess('Category deleted successfully!');
        loadCategories();
      } else {
        setError(response.message || 'Failed to delete category');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting category');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', slug: '', imageUrl: '', description: '' });
    setError('');
  };

  return (
    <AdminLayout currentPage="categories" onNavigate={onNavigate}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Categories Management</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Category
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
            <div className="bg-white rounded-t-lg sm:rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                {editingId ? 'Edit Category' : 'New Category'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter category name"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="Enter slug (auto-generated from name)"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="Enter image URL"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter category description"
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                />
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

        {/* Categories List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-slate-50 rounded-lg p-12 text-center">
            <p className="text-slate-600 mb-4">No categories found</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Create First Category
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">Name</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">Slug</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">Image</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category._id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-900">{category.name}</td>
                    <td className="px-6 py-3 text-slate-600">{category.slug}</td>
                    <td className="px-6 py-3">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <span className="text-slate-400">No image</span>
                      )}
                    </td>
                    <td className="px-6 py-3 flex gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}