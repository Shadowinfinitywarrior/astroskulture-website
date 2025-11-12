import { useEffect, useState } from 'react';
import { Calendar, ArrowLeft, Share2 } from 'lucide-react';
import { apiService } from '../lib/mongodb';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl?: string;
  publishedAt: string;
  views: number;
  tags: string[];
}

interface BlogDetailPageProps {
  slug: string;
  onNavigate: (page: string, params?: any) => void;
}

export function BlogDetailPage({ slug, onNavigate }: BlogDetailPageProps) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBlog();
  }, [slug]);

  const loadBlog = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await apiService.getBlog(slug);
      
      if (response.success) {
        setBlog(response.data);
      } else {
        throw new Error(response.message || 'Blog not found');
      }
    } catch (error) {
      console.error('Error loading blog:', error);
      setError(error instanceof Error ? error.message : 'Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error || 'Blog not found'}</p>
            <button
              onClick={() => onNavigate('blog')}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Back to Blogs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <button
          onClick={() => onNavigate('blog')}
          className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Blogs</span>
        </button>
      </div>

      {/* Hero Image */}
      {blog.imageUrl && (
        <div className="w-full h-96 bg-gray-200 overflow-hidden">
          <img
            src={blog.imageUrl}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {blog.title}
          </h1>
          
          {/* Meta Information */}
          <div className="flex items-center space-x-6 text-gray-600 pb-8 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span>
                {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <span>{blog.views} views</span>
            <button className="flex items-center space-x-2 hover:text-red-600 transition-colors">
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div 
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </article>

      {/* Related Posts Section - Could be added later */}
      <section className="bg-gray-100 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">More from Blog</h2>
          <button
            onClick={() => onNavigate('blog')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            View All Blogs
          </button>
        </div>
      </section>
    </div>
  );
}