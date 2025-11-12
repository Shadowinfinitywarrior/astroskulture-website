import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';
import { apiService } from '../../lib/mongodb';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  publishedAt: string;
  published: boolean;
  tags: string[];
  views: number;
}

interface AdminBlogPageProps {
  onNavigate: (page: string) => void;
}

export default function AdminBlogPage({ onNavigate }: AdminBlogPageProps) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    tags: '',
    published: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const response = await apiService.adminGetAllBlogs();
      if (response.success) {
        setBlogs(response.data || []);
      } else {
        setError('Failed to load blogs');
      }
    } catch (err) {
      setError('Error loading blogs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'title') {
      setFormData({
        ...formData,
        [name]: value,
        slug: generateSlug(value)
      });
    } else if (name === 'published') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.excerpt || !formData.content) {
      setError('Title, excerpt, and content are required');
      return;
    }

    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);

      const blogData = {
        ...formData,
        tags
      };

      let response;
      if (editingId) {
        response = await apiService.adminUpdateBlog(editingId, blogData);
      } else {
        response = await apiService.adminCreateBlog(blogData);
      }

      if (response.success) {
        setSuccess(editingId ? 'Blog updated successfully!' : 'Blog created successfully!');
        setFormData({
          title: '',
          slug: '',
          excerpt: '',
          content: '',
          imageUrl: '',
          tags: '',
          published: true
        });
        setEditingId(null);
        setShowForm(false);
        loadBlogs();
      } else {
        setError(response.message || 'Failed to save blog');
      }
    } catch (err) {
      setError('Error saving blog');
      console.error(err);
    }
  };

  const handleEdit = (blog: Blog) => {
    setFormData({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      imageUrl: blog.imageUrl || '',
      tags: blog.tags.join(', '),
      published: blog.published
    });
    setEditingId(blog._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      const response = await apiService.adminDeleteBlog(id);
      if (response.success) {
        setSuccess('Blog deleted successfully!');
        loadBlogs();
      } else {
        setError(response.message || 'Failed to delete blog');
      }
    } catch (err) {
      setError('Error deleting blog');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      imageUrl: '',
      tags: '',
      published: true
    });
    setError('');
  };

  return (
    <AdminLayout currentPage="blogs" onNavigate={onNavigate}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Blog
            </button>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Form Modal - Mobile Responsive */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white rounded-t-lg sm:rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">
                {editingId ? 'Edit Blog' : 'Create New Blog'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Blog title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug (auto-generated)
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="blog-slug"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {formData.imageUrl && (
                  <div className="mt-2 w-full h-40 rounded-lg overflow-hidden">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt *
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Short summary of the blog"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Blog content (you can use HTML formatting)"
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
                  required
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="tag1, tag2, tag3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Published */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Publish this blog
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-700 transition-colors w-full sm:w-auto"
                >
                  <Save className="w-4 sm:w-5 h-4 sm:h-5" />
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center justify-center gap-2 bg-gray-300 text-gray-700 px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors w-full sm:w-auto"
                >
                  <X className="w-4 sm:w-5 h-4 sm:h-5" />
                  Cancel
                </button>
              </div>
            </form>
            </div>
          </div>
        )}

        {/* Blogs List */}
        {!showForm && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                Loading blogs...
              </div>
            ) : blogs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No blogs found. Create your first blog!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Excerpt
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {blogs.map((blog) => (
                      <tr key={blog._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {blog.imageUrl && (
                              <img
                                src={blog.imageUrl}
                                alt={blog.title}
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{blog.title}</p>
                              <p className="text-xs text-gray-500">{blog.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {blog.excerpt}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            {blog.published ? (
                              <>
                                <Eye className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-600">Published</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-400">Draft</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{blog.views}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(blog)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(blog._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}