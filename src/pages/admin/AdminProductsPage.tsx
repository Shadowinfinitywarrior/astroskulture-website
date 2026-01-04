import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Plus, Edit, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  gstPercentage?: number;
  gstApplicable?: boolean;
  shippingFee?: number;
  freeShippingAbove?: number;
  category: string;
  images: Array<{ url: string; alt?: string }>;
  sizes: Array<{ size: string; stock: number }>;
  totalStock: number;
  isFeatured: boolean;
  isActive: boolean;
  slug: string;
  rating: number;
  reviewCount: number;
  colors: string[];
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

interface AdminProductsPageProps {
  onNavigate: (page: string) => void;
}

export default function AdminProductsPage({ onNavigate }: AdminProductsPageProps) {
  const { isAuthenticated, login, loading: authLoading } = useAdminAuth();
  const [products, setProducts] = useState < Product[] > ([]);
  const [categories, setCategories] = useState < Category[] > ([]); // NEW: Categories state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState < Product | null > (null);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(false); // NEW: Categories loading state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    discountPrice: 0,
    gstPercentage: 18,
    gstApplicable: true,
    shippingFee: 0,
    freeShippingAbove: 999,
    category: '',
    images: [{ url: '', alt: '' }],
    sizes: [
      { size: 'S', stock: 0 },
      { size: 'M', stock: 0 },
      { size: 'L', stock: 0 },
      { size: 'XL', stock: 0 },
      { size: 'XXL', stock: 0 }
    ],
    colors: [] as string[],
    isFeatured: false,
    isActive: true,
  });

  const STANDARD_COLORS = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow'];
  const [customColor, setCustomColor] = useState('');

  // FIXED: Use environment-based API URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD
      ? 'https://astroskulture-website.onrender.com/api'
      : 'http://localhost:5000/api'
    );

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchCategories(); // NEW: Fetch categories when authenticated
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      console.log('📦 Fetching products from:', `${API_BASE_URL}/admin/products`);
      console.log('📦 Token present:', !!token);

      const response = await fetch(`${API_BASE_URL}/admin/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📦 Products response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('📦 Products data received:', result.data?.length || 0, 'products');

        if (result.success) {
          setProducts(result.data || []);
        } else {
          console.error('Error in response:', result.message);
          setProducts([]);
        }
      } else {
        const errorText = await response.text();
        console.error('HTTP Error:', response.status, errorText);

        if (response.status === 401) {
          // Token is invalid, clear it
          localStorage.removeItem('adminToken');
          window.location.reload();
        }

        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Fetch categories function
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      console.log('📂 Fetching categories...');

      const response = await fetch(`${API_BASE_URL}/categories`);

      if (response.ok) {
        const result = await response.json();
        console.log('📂 Categories data received:', result.data?.length || 0, 'categories');

        if (result.success) {
          setCategories(result.data || []);
        } else {
          console.error('Error fetching categories:', result.message);
          setCategories([]);
        }
      } else {
        console.error('HTTP Error fetching categories:', response.status);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginForm.username, loginForm.password);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Admin login failed. Please check your credentials.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    try {
      const url = editingProduct
        ? `${API_BASE_URL}/admin/products/${editingProduct._id}`
        : `${API_BASE_URL}/admin/products`;

      const method = editingProduct ? 'PUT' : 'POST';

      // FIXED: Proper number conversion with validation
      const price = Number(formData.price);
      const discountPrice = formData.discountPrice ? Number(formData.discountPrice) : undefined;

      const categoryId = typeof formData.category === 'object' ? formData.category._id : formData.category;

      // Validate required fields
      if (!formData.name.trim() || !formData.description.trim() || price < 0 || !categoryId) {
        alert('Please fill in all required fields with valid values');
        return;
      }

      // Validate discount price is less than regular price
      if (discountPrice && discountPrice >= price) {
        alert('Discount price must be less than regular price');
        return;
      }

      // Validate that category exists
      const selectedCategory = categories.find(cat => cat._id === categoryId);
      if (!selectedCategory) {
        alert('Please select a valid category');
        return;
      }

      // Validate at least one image URL
      const validImages = formData.images.filter(img => img.url.trim() !== '');
      if (validImages.length === 0) {
        alert('Please add at least one product image URL');
        return;
      }

      // Calculate total stock
      const totalStock = formData.sizes.reduce((sum, size) => sum + (Number(size.stock) || 0), 0);

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: price,
        discountPrice: discountPrice,
        gstPercentage: Number(formData.gstPercentage) || 18,
        gstApplicable: formData.gstApplicable,
        shippingFee: Number(formData.shippingFee) !== '' ? Number(formData.shippingFee) : 0,
        freeShippingAbove: Number(formData.freeShippingAbove) !== '' ? Number(formData.freeShippingAbove) : 0,
        category: categoryId,
        images: validImages,
        sizes: formData.sizes.map(size => ({
          size: size.size,
          stock: Number(size.stock) || 0
        })),
        colors: formData.colors,
        totalStock,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
      };

      console.log('💾 Saving product to:', url);
      console.log('💾 Payload:', payload);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        // Get detailed error message from backend
        const errorMessage = result.message || result.error || `HTTP error! status: ${response.status}`;
        console.error('❌ Backend error details:', result);
        throw new Error(errorMessage);
      }

      if (result.success) {
        console.log('✅ Product saved successfully');
        fetchProducts();
        closeModal();
        alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
      } else {
        throw new Error(result.message || 'Failed to save product');
      }
    } catch (error: any) {
      console.error('❌ Error saving product:', error);
      alert(`Failed to save product: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const token = localStorage.getItem('adminToken');

    try {
      console.log('🗑️ Deleting product:', id);

      const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Product deleted successfully');
        fetchProducts();
        alert('Product deleted successfully!');
      } else {
        console.error('Error deleting product:', result.message);
        alert(result.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const addImageField = () => {
    setFormData({
      ...formData,
      images: [...formData.images, { url: '', alt: '' }]
    });
  };

  const removeImageField = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const updateImageField = (index: number, field: 'url' | 'alt', value: string) => {
    const newImages = formData.images.map((image, i) =>
      i === index ? { ...image, [field]: value } : image
    );
    setFormData({ ...formData, images: newImages });
  };

  const updateSizeStock = (sizeIndex: number, stock: number) => {
    const newSizes = formData.sizes.map((size, i) =>
      i === sizeIndex ? { ...size, stock: Number(stock) || 0 } : size
    );
    setFormData({ ...formData, sizes: newSizes });
  };

  const handleColorToggle = (color: string) => {
    setFormData(prev => {
      if (prev.colors.includes(color)) {
        return { ...prev, colors: prev.colors.filter(c => c !== color) };
      } else {
        return { ...prev, colors: [...prev.colors, color] };
      }
    });
  };

  const addCustomColor = () => {
    if (customColor.trim() && !formData.colors.includes(customColor.trim())) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, customColor.trim()]
      }));
      setCustomColor('');
    }
  };

  const removeColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== color)
    }));
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice || 0,
        gstPercentage: product.gstPercentage || 18,
        gstApplicable: product.gstApplicable !== undefined ? product.gstApplicable : true,
        shippingFee: product.shippingFee !== undefined ? product.shippingFee : 0,
        freeShippingAbove: product.freeShippingAbove !== undefined ? product.freeShippingAbove : 999,
        category: product.category,
        images: (product.images.length > 0 ? product.images : [{ url: '', alt: '' }]) as any,
        sizes: product.sizes,
        colors: product.colors || [],
        isFeatured: product.isFeatured,
        isActive: product.isActive,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        discountPrice: 0,
        gstPercentage: 18,
        gstApplicable: true,
        shippingFee: 0,
        freeShippingAbove: 999,
        category: '',
        images: [{ url: '', alt: '' }],
        sizes: [
          { size: 'S', stock: 0 },
          { size: 'M', stock: 0 },
          { size: 'L', stock: 0 },
          { size: 'XL', stock: 0 },
          { size: 'XXL', stock: 0 }
        ],
        colors: [],
        isFeatured: false,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <AdminLayout currentPage="products" onNavigate={onNavigate}>
        <div className="max-w-md mx-auto mt-16">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Admin Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="Enter username or email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 text-white py-2 px-4 rounded-lg hover:bg-slate-800 transition-colors"
                disabled={authLoading}
              >
                {authLoading ? 'Logging in...' : 'Login'}
              </button>
              <div className="text-center text-sm text-gray-500 mt-4">
                <p>Demo Credentials:</p>
                <p>Username: <strong>admin</strong></p>
                <p>Password: <strong>admin123</strong></p>
              </div>
            </form>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout currentPage="products" onNavigate={onNavigate}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-slate-600">Loading products...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="products" onNavigate={onNavigate}>
      <div className="max-w-7xl mx-auto px-2 sm:px-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Products</h1>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={fetchProducts}
              className="flex-1 sm:flex-none bg-slate-100 text-slate-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors text-sm sm:text-base"
            >
              Refresh
            </button>
            <button
              onClick={() => openModal()}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-slate-900 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">No products found.</p>
              <button
                onClick={fetchProducts}
                className="mt-4 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Retry Loading Products
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Images
                    </th>
                    <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Featured
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 sm:gap-4">
                          <img
                            src={product.images[0]?.url || '/placeholder-image.jpg'}
                            alt={product.name}
                            className="w-8 h-8 sm:w-12 sm:h-12 rounded object-cover"
                          />
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-medium text-slate-900 truncate">{product.name}</div>
                            <div className="hidden sm:block text-xs text-slate-500 truncate">{product.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-slate-900">₹{(product.discountPrice || product.price).toLocaleString()}</div>
                        {product.discountPrice && (
                          <div className="text-xs text-slate-500 line-through">₹{product.price.toLocaleString()}</div>
                        )}
                      </td>
                      <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-900">
                        {product.totalStock}
                      </td>
                      <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex -space-x-2">
                          {product.images.slice(0, 2).map((image, index) => (
                            <img
                              key={index}
                              src={image.url || '/placeholder-image.jpg'}
                              alt=""
                              className="w-6 h-6 sm:w-8 sm:h-8 rounded border-2 border-white object-cover"
                            />
                          ))}
                          {product.images.length > 2 && (
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-slate-100 border-2 border-white flex items-center justify-center text-xs text-slate-500">
                              +{product.images.length - 2}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-900">
                        {product.isFeatured ? '✓' : ''}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                        <button
                          onClick={() => openModal(product)}
                          className="text-slate-600 hover:text-slate-900 p-1 rounded hover:bg-slate-100 transition-colors inline-block"
                          title="Edit product"
                        >
                          <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors inline-block"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-lg sm:rounded-lg p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    required
                  />
                </div>

                {/* FIXED: Category dropdown instead of free text input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent ${editingProduct ? 'bg-slate-100 cursor-not-allowed' : ''
                      }`}
                    disabled={editingProduct ? true : false}
                    required
                  >
                    <option value="">Select a category</option>
                    {categoriesLoading ? (
                      <option disabled>Loading categories...</option>
                    ) : (
                      categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))
                    )}
                  </select>
                  {editingProduct && (
                    <p className="text-sm text-slate-600 mt-1">
                      Category cannot be changed after product creation.
                    </p>
                  )}
                  {categories.length === 0 && !categoriesLoading && !editingProduct && (
                    <p className="text-sm text-red-600 mt-1">
                      No categories found. Please create categories first in the admin panel.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Discount Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">GST Percentage (%)</label>
                  <div className="flex gap-2 items-end">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.gstPercentage}
                      onChange={(e) => setFormData({ ...formData, gstPercentage: Number(e.target.value) || 18 })}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      disabled={!formData.gstApplicable}
                    />
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="gstApplicable"
                        checked={formData.gstApplicable}
                        onChange={(e) => setFormData({ ...formData, gstApplicable: e.target.checked })}
                        className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                      />
                      <label htmlFor="gstApplicable" className="ml-2 text-sm text-slate-700 whitespace-nowrap">
                        Apply GST
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Shipping Fee (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.shippingFee}
                    onChange={(e) => setFormData({ ...formData, shippingFee: e.target.value === '' ? 0 : Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Free Shipping Above (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.freeShippingAbove}
                    onChange={(e) => setFormData({ ...formData, freeShippingAbove: e.target.value === '' ? 0 : Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Images Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-slate-700">Product Images</label>
                  <button
                    type="button"
                    onClick={addImageField}
                    className="flex items-center space-x-1 text-sm text-slate-600 hover:text-slate-900"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Add Image</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <div className="flex-1">
                        <input
                          type="url"
                          placeholder="Image URL"
                          value={image.url}
                          onChange={(e) => updateImageField(index, 'url', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Alt text"
                          value={image.alt}
                          onChange={(e) => updateImageField(index, 'alt', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                        />
                      </div>
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800 sm:self-start"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sizes Section */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">Size & Stock</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {formData.sizes.map((size, index) => (
                    <div key={size.size} className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 text-center">
                        {size.size}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={size.stock}
                        onChange={(e) => updateSizeStock(index, Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors Section */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">Colors</label>

                {/* Standard Colors */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Standard Colors</p>
                  <div className="flex flex-wrap gap-3">
                    {STANDARD_COLORS.map(color => (
                      <label key={color} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.colors.includes(color)}
                          onChange={() => handleColorToggle(color)}
                          className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                        />
                        <span className="text-sm text-slate-700">{color}</span>
                        <span
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: color.toLowerCase() }}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Custom Colors */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Custom Colors</p>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      placeholder="Enter custom color"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomColor())}
                    />
                    <button
                      type="button"
                      onClick={addCustomColor}
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Selected Colors Preview */}
                {formData.colors.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg">
                    {formData.colors.map(color => (
                      <span
                        key={color}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white border border-slate-200 shadow-sm"
                      >
                        <span
                          className="w-3 h-3 rounded-full mr-1.5 border border-gray-200"
                          style={{ backgroundColor: color.toLowerCase() }}
                        />
                        {color}
                        <button
                          type="button"
                          onClick={() => removeColor(color)}
                          className="ml-1.5 text-slate-400 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-4 sm:space-y-0 pt-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                    />
                    <label htmlFor="featured" className="ml-2 text-sm text-slate-700">
                      Featured Product
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                    />
                    <label htmlFor="active" className="ml-2 text-sm text-slate-700">
                      Active
                    </label>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row space-y-2 sm:space-y-0 space-y-reverse sm:space-x-3 sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm sm:text-base disabled:opacity-50"
                    disabled={categories.length === 0}
                  >
                    {editingProduct ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}