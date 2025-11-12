import { useEffect, useState } from 'react';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { apiService } from '../lib/mongodb';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  publishedAt: string;
  views: number;
  tags: string[];
}

interface BlogPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export function BlogPage({ onNavigate }: BlogPageProps) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await apiService.getBlogs();
      
      if (response.success) {
        setBlogs(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to load blogs');
      }
    } catch (error) {
      console.error('Error loading blogs:', error);
      setError(error instanceof Error ? error.message : 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const getAllTags = () => {
    const tagsSet = new Set<string>();
    blogs.forEach(blog => {
      blog.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  };

  const filteredBlogs = selectedTag 
    ? blogs.filter(blog => blog.tags?.includes(selectedTag))
    : blogs;

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-lg text-gray-100">Discover insights, stories, and updates from ASTROS KULTURE</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadBlogs}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Blog List */}
          <div className="flex-1">
            {filteredBlogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">
                  {selectedTag ? `No blogs found with tag "${selectedTag}"` : 'No blogs available yet'}
                </p>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {filteredBlogs.map((blog) => (
                  <article
                    key={blog._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => onNavigate('blog-detail', { slug: blog.slug })}
                  >
                    {blog.imageUrl && (
                      <div className="h-64 overflow-hidden bg-gray-200">
                        <img
                          src={blog.imageUrl}
                          alt={blog.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <span className="flex items-center space-x-1">
                          <span className="text-gray-400">•</span>
                          <span>{blog.views} views</span>
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-red-600 transition-colors">
                        {blog.title}
                      </h2>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {blog.excerpt || blog.content.substring(0, 160)}...
                      </p>
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {blog.tags.map((tag) => (
                            <span
                              key={tag}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTag(tag);
                              }}
                              className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full cursor-pointer hover:bg-red-200 transition-colors"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center text-red-600 font-medium hover:gap-2 transition-all">
                        <span>Read More</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-80">
            {/* Tags Widget */}
            {getAllTags().length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-20">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Filter by Tags</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                      selectedTag === null
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Blogs
                  </button>
                  {getAllTags().map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                        selectedTag === tag
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Posts Widget */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Posts</h3>
              <div className="space-y-4">
                {blogs.slice(0, 5).map((blog) => (
                  <button
                    key={blog._id}
                    onClick={() => onNavigate('blog-detail', { slug: blog.slug })}
                    className="block w-full text-left p-3 bg-gray-50 hover:bg-red-50 rounded transition-colors"
                  >
                    <h4 className="font-medium text-gray-900 text-sm hover:text-red-600 line-clamp-2">
                      {blog.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(blog.publishedAt).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}